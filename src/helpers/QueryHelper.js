import _ from "lodash";
import StringHelper from "./StringHelper";
import { getDataForSelect } from "../db/SelectDb";
import { startFirebaseApp } from "../db/FirebaseDb";
import { pushObject, deleteObject, updateFields } from "../db/UpdateDb";
import { isValidDate, executeDateComparison } from "../helpers/DateHelper";
import QueryDetails from "../stores/models/QueryDetails";
const NO_EQUALITY_STATEMENTS = "NO_EQUALITY_STATEMENTS";
const SELECT_STATEMENT = "SELECT_STATEMENT";
const UPDATE_STATEMENT = "UPDATE_STATEMENT";
const INSERT_STATEMENT = "INSERT_STATEMENT";
const DELETE_STATEMENT = "DELETE_STATEMENT";
const FIRESTATION_DATA_PROP = "FIRESTATION_DATA_PROP";
const EQUATION_IDENTIFIERS = [" / ", " + ", " - ", " * "];

export default class QueryHelper {
  static getRootKeysPromise(database) {
    if (!database) {
      return null;
    }
    const url =
      "https://" +
      database.config.projectId +
      ".firebaseio.com//.json?shallow=true";
    return fetch(url).then(response => {
      return response.json();
    });
  }

  static executeQuery(query, db, callback, commitResults) {
    //maybe delete these two lines, but i think it may do something important..
    //cant remember.. >.<, all listeners should already be killed on App.executeQuery()
    // let ref = db.ref("/");
    // ref.off("value");

    const statementType = this.determineStatementType(query);
    if (statementType === SELECT_STATEMENT) {
      this.executeSelect(query, db, callback);
    } else if (statementType === UPDATE_STATEMENT) {
      return this.executeUpdate(query, db, callback, commitResults);
    } else if (statementType === DELETE_STATEMENT) {
      return this.executeDelete(query, db, callback, commitResults);
    } else if (statementType === INSERT_STATEMENT) {
      return this.executeInsert(query, db, callback, commitResults);
    }
  }

  static formatAndCleanQuery(query) {
    console.log("format and clean query:", query);

    //called by App.jsx to remove comments before saving to history
    query = StringHelper.replaceAll(query, /(\/\/|--).+/, "");
    query = query.replace(/\r?\n|\r/g, " ");
    query = query.trim();
    return query;
  }

  static executeInsert(query, db, callback, commitResults) {
    const collection = this.getCollection(query, INSERT_STATEMENT);
    const that = this;
    const insertCount = this.getInsertCount(query);
    const path = collection + "/";
    this.getObjectsFromInsert(query, db, !commitResults, insertObjects => {
      if (commitResults) {
        let keys = insertObjects && Object.keys(insertObjects);
        for (let i = 1; i < insertCount; i++) {
          //insert clones
          pushObject(db, path, insertObjects[keys[0]]);
        }
        for (let key in insertObjects) {
          pushObject(db, path, insertObjects[key]);
        }
      }
      let results = {
        insertCount: insertCount,
        statementType: INSERT_STATEMENT,
        payload: insertObjects,
        path: path
      };
      callback(results);
    });
  }

  static executeDelete(query, db, callback, commitResults) {
    const collection = this.getCollection(query, DELETE_STATEMENT);
    const that = this;
    this.getWheres(query, db, wheres => {
      getDataForSelect(
        db,
        collection,
        null,
        wheres,
        null,
        !commitResults,
        dataToAlter => {
          if (dataToAlter && commitResults) {
            Object.keys(dataToAlter.payload).forEach((objKey, index) => {
              const path = collection + "/" + objKey;
              deleteObject(db, path);
            });
          }
          let results = {
            statementType: DELETE_STATEMENT,
            payload: dataToAlter.payload,
            firebaseListener: dataToAlter.firebaseListener,
            path: collection
          };
          callback(results);
        }
      );
    });
  }

  static executeSelect(query, db, callback) {
    let col = this.getCollection(query, SELECT_STATEMENT);
    const { collection, isFirestore } = this.checkForCrossDbQuery(db, col);

    let queryDetails = new QueryDetails();
    queryDetails.collection = collection;
    queryDetails.isFirestore = isFirestore;
    queryDetails.orderBys = this.getOrderBys(query);
    queryDetails.selectedFields = this.getSelectedFields(query);
    queryDetails.shouldApplyListener = true;

    this.getWheres(query, db, wheres => {
      queryDetails.wheres = wheres;
      getDataForSelect(db, queryDetails, callback);
    });
  }

  static executeUpdate(query, db, callback, commitResults) {
    const col = this.getCollection(query, UPDATE_STATEMENT);
    const { collection, isFirestore } = this.checkForCrossDbQuery(db, col);

    const sets = this.getSets(query);
    if (!sets) {
      return null;
    }
    const that = this;
    this.getWheres(query, db, wheres => {
      let queryDetails = new QueryDetails();
      queryDetails.collection = collection;
      queryDetails.isFirestore = isFirestore;
      queryDetails.db = db;
      queryDetails.wheres = wheres;
      getDataForSelect(db, queryDetails, dataToAlter => {
        let data = dataToAlter.payload;
        let payload = {};
        Object.keys(data).forEach((objKey, index) => {
          let updateObj = that.updateItemWithSets(data[objKey], sets);
          console.log("update object b4 call:", updateObj);
          const path = collection + "/" + objKey;
          if (commitResults) {
            updateFields(db, path, updateObj, Object.keys(sets));
          }
          payload[objKey] = updateObj;
        });
        let results = {
          statementType: UPDATE_STATEMENT,
          payload,
          firebaseListener: dataToAlter.firebaseListener,
          path: collection
        };
        callback(results);
      });
    });
  }

  static updateItemWithSets(obj, sets) {
    const that = this;
    let updateObject = _.clone(obj);
    Object.keys(sets).forEach((objKey, index) => {
      const thisSet = sets[objKey];
      if (
        thisSet &&
        typeof thisSet === "object" &&
        thisSet.hasOwnProperty(FIRESTATION_DATA_PROP)
      ) {
        //execute equation
        const newVal = thisSet.FIRESTATION_DATA_PROP;
        for (let i = 0; i < EQUATION_IDENTIFIERS.length; i++) {
          if (newVal.includes(EQUATION_IDENTIFIERS[i])) {
            updateObject[objKey] = that.executeUpdateEquation(
              updateObject,
              thisSet.FIRESTATION_DATA_PROP
            );
            return updateObject;
          }
        }
        //not an equation, treat it as an individual prop
        let finalValue = updateObject[newVal];
        if (newVal.includes(".")) {
          let props = newVal.split(".");
          finalValue = updateObject[props[0]];
          for (let i = 1; updateObjecti < props.length; i++) {
            finalValue = finalValue[props[i]];
          }
        }
        updateObject[objKey] = finalValue;
      } else {
        if (objKey.includes("/")) {
          // "users/userId/name" -> users: { userId: { name: ""}}, etc
          if (typeof updateObject !== "object") {
            updateObject = {};
          }
          let currentObject = updateObject;
          let dataPath = objKey.split("/");
          dataPath.forEach((val, i) => {
            if (i === dataPath.length - 1) {
              currentObject[val] = thisSet;
            } else {
              let currVal = currentObject[val];

              currentObject[val] =
                currVal && typeof currVal === "object"
                  ? currentObject[val]
                  : {};
            }
            currentObject = currentObject[val];
          });
        } else {
          updateObject[objKey] = thisSet;
        }
      }
    });
    return updateObject;
  }

  static executeUpdateEquation(existingObject, equation) {
    //replace variable names with corresponding values:
    existingObject &&
      Object.keys(existingObject).forEach(key => {
        let newValue = existingObject[key];
        if (typeof newValue !== "number") {
          newValue = '"' + newValue + '"';
        }
        equation = StringHelper.replaceAll(equation, key, newValue);
      });
    //execute
    return eval(equation);
  }

  static determineStatementType(query) {
    let q = query.trim();
    let firstTerm = q
      .split(" ")[0]
      .trim()
      .toLowerCase();
    switch (firstTerm) {
      case "select":
        return SELECT_STATEMENT;
      case "update":
        return UPDATE_STATEMENT;
      case "insert":
        return INSERT_STATEMENT;
      case "delete":
        return DELETE_STATEMENT;
      default:
        return SELECT_STATEMENT;
    }
  }

  static getWheres(query, db, callback) {
    const whereIndexStart = query.indexOf(" where ") + 1;
    if (whereIndexStart < 1) {
      return callback(null);
    }
    const orderByIndex = query.toUpperCase().indexOf("ORDER BY");
    const whereIndexEnd = orderByIndex >= 0 ? orderByIndex : query.length;
    let wheresArr = query
      .substring(whereIndexStart + 5, whereIndexEnd)
      .split(" and ");
    wheresArr[wheresArr.length - 1] = wheresArr[wheresArr.length - 1].replace(
      ";",
      ""
    );
    let wheres = [];
    wheresArr.forEach(where => {
      where = StringHelper.replaceAllIgnoreCase(where, "not like", "!like");
      let eqCompAndIndex = this.determineComparatorAndIndex(where);
      let whereObj = {
        field: StringHelper.replaceAll(
          where.substring(0, eqCompAndIndex.index).trim(),
          "\\.",
          "/"
        ),
        comparator: eqCompAndIndex.comparator
      };
      let val = StringHelper.getParsedValue(
        where
          .substring(eqCompAndIndex.index + eqCompAndIndex.comparator.length)
          .trim()
      );
      const isFirestore = db.firestoreEnabled;
      if (
        typeof val === "string" &&
        val.charAt(0) === "(" &&
        val.charAt(val.length - 1) === ")"
      ) {
        this.executeSelect(val.substring(1, val.length - 1), db, results => {
          whereObj.value = results.payload;
          wheres.push(whereObj);
          if (wheresArr.length === wheres.length) {
            return callback(this.optimizeWheres(wheres, isFirestore));
          }
        });
      } else {
        whereObj.value = val;
        wheres.push(whereObj);
        if (wheresArr.length === wheres.length) {
          return callback(this.optimizeWheres(wheres, isFirestore));
        }
      }
    });
  }

  static getSets(query) {
    const setIndexStart = query.indexOf(" set ") + 1;
    if (setIndexStart < 1) {
      return null;
    }
    const whereIndexStart = query.indexOf(" where ") + 1;
    let setsArr;
    if (whereIndexStart > 0) {
      setsArr = query.substring(setIndexStart + 3, whereIndexStart).split(", ");
    } else {
      setsArr = query.substring(setIndexStart + 3).split(", ");
      setsArr[setsArr.length - 1] = setsArr[setsArr.length - 1].replace(
        ";",
        ""
      );
    }
    let sets = {};
    setsArr.forEach(item => {
      let keyValSplit = item.split("=");
      if (keyValSplit.length === 2) {
        let key = keyValSplit[0].replace(".", "/").trim();
        sets[key] = StringHelper.getParsedValue(keyValSplit[1].trim(), true);
      }
    });
    return sets;
  }

  static getOrderBys(query) {
    let caps = query.toUpperCase();
    const ORDER_BY = "ORDER BY";
    let index = caps.indexOf(ORDER_BY);
    if (index < 0) {
      return null;
    }
    let orderByStr = query.substring(index + ORDER_BY.length);
    let split = orderByStr.split(",");
    let orderBys = split.map(orderBy => {
      let propToSort = orderBy.replace(";", "").trim();
      propToSort =
        propToSort.indexOf(" ") >= 0
          ? propToSort.substring(0, propToSort.indexOf(" "))
          : propToSort;
      let orderByObj = {
        ascending: true,
        propToSort: propToSort.trim()
      };
      if (orderBy.toUpperCase().includes("DESC")) {
        orderByObj.ascending = false;
      }
      return orderByObj;
    });
    return orderBys;
  }

  static getCollection(q, statementType) {
    let query = q.replace(/\(.*\)/, "").trim(); //removes nested selects
    let terms = query.split(" ");
    if (statementType === UPDATE_STATEMENT) {
      return StringHelper.replaceAll(terms[1], /\./, "/");
    } else if (statementType === SELECT_STATEMENT) {
      if (terms.length === 2 && terms[0] === "from") {
        return StringHelper.replaceAll(terms[1], ".", "/");
      } else if (terms.length === 1) {
        let collection = terms[0].replace(";", "");
        return StringHelper.replaceAll(collection, /\./, "/");
      }
      let collectionIndexStart = query.indexOf("from ") + 4;
      if (collectionIndexStart < 0) {
        throw "Error determining collection.";
      }
      if (collectionIndexStart < 5) {
        return StringHelper.replaceAll(terms[0], /\./, "/");
      }
      let trimmedCol = query.substring(collectionIndexStart).trim();
      let collectionIndexEnd = trimmedCol.match(/\ |;|$/).index;
      let collection = trimmedCol.substring(0, collectionIndexEnd);
      return StringHelper.replaceAll(collection, /\./, "/");
    } else if (statementType === INSERT_STATEMENT) {
      let collectionToInsert =
        terms[1].toUpperCase() === "INTO" ? terms[2] : terms[3];
      return StringHelper.replaceAll(collectionToInsert, /\./, "/");
    } else if (statementType === DELETE_STATEMENT) {
      let index = terms.length > 2 ? 2 : 1;
      let term = StringHelper.replaceAll(terms[index], /;/, "");
      return StringHelper.replaceAll(term, /\./, "/");
    }
    throw "Error determining collection.";
  }

  static getSelectedFields(q) {
    let query = q.trim();
    if (!query.startsWith("select ") || query.startsWith("select *")) {
      return null;
    }
    let regExp = /(.*select\s+)(.*)(\s+from.*)/;
    let froms = query.replace(regExp, "$2");
    if (froms.length === query.length) {
      return null;
    }
    let fields = froms.split(",");
    if (fields.length === 0) {
      return null;
    }
    let selectedFields = {};
    fields.map(field => {
      selectedFields[field.trim()] = true;
    });
    return selectedFields;
  }

  static getObjectsFromInsert(query, db, shouldApplyListener, callback) {
    //insert based on select data
    if (/^(insert into )[^\s]+( select).+/i.test(query)) {
      const queryUpper = query.toUpperCase();
      const that = this;
      const selectStatement = query
        .substring(queryUpper.indexOf("SELECT "))
        .trim();
      const selectedFields = this.getSelectedFields(selectStatement);
      const collection = this.getCollection(selectStatement, SELECT_STATEMENT);
      this.getWheres(selectStatement, db, wheres => {
        getDataForSelect(
          db,
          collection,
          selectedFields,
          wheres,
          shouldApplyListener,
          null,
          selectData => {
            // console.log()

            return callback(selectData.payload);
          }
        );
      });
    } else {
      //traditional insert
      let keysStr = query.substring(query.indexOf("(") + 1, query.indexOf(")"));
      let keys = keysStr.split(",");

      let valuesStr = query.match(/(values).+\);/)[0];
      let valuesStrArr = valuesStr.split(/[\(](?!\))/); //splits on "(", unless its a function "func()"
      valuesStrArr.shift(); //removes "values ("
      let valuesArr = valuesStrArr.map(valueStr => {
        return valueStr.substring(0, valueStr.lastIndexOf(")")).split(",");
      });
      if (!keys || !valuesArr) {
        throw "Badly formatted insert statement";
      }
      let insertObjects = {};
      valuesArr.forEach((values, valuesIndex) => {
        let insertObject = {};
        keys.forEach((key, keyIndex) => {
          insertObject[
            StringHelper.getParsedValue(key.trim())
          ] = StringHelper.getParsedValue(values[keyIndex].trim());
        });
        insertObjects["pushId_" + valuesIndex] = insertObject;
      });

      return callback(insertObjects);
    }
  }

  static determineComparatorAndIndex(where) {
    let notEqIndex = this.getNotEqualIndex(where);
    if (notEqIndex >= 0) {
      return { comparator: "!=", index: notEqIndex };
    }

    let greaterThanEqIndex = where.indexOf(">=");
    if (greaterThanEqIndex >= 0) {
      return { comparator: ">=", index: greaterThanEqIndex };
    }

    let greaterThanIndex = where.indexOf(">");
    if (greaterThanIndex >= 0) {
      return { comparator: ">", index: greaterThanIndex };
    }

    let lessThanEqIndex = where.indexOf("<=");
    if (lessThanEqIndex >= 0) {
      return { comparator: "<=", index: lessThanEqIndex };
    }
    let lessThanIndex = where.indexOf("<");
    if (lessThanIndex >= 0) {
      return { comparator: "<", index: lessThanIndex };
    }

    let notLikeIndex = where.toLowerCase().indexOf("!like");
    if (notLikeIndex >= 0) {
      return { comparator: "!like", index: notLikeIndex };
    }

    let likeIndex = where.toLowerCase().indexOf("like");
    if (likeIndex >= 0) {
      return { comparator: "like", index: likeIndex };
    }

    let eqIndex = where.indexOf("=");
    if (eqIndex >= 0) {
      return { comparator: "==", index: eqIndex };
    }

    throw "Unrecognized comparator in where clause: '" + where + "'.";
  }

  static getInsertCount(query) {
    const splitQ = query.trim().split(" ");
    if (splitQ[0].toUpperCase() === "INSERT" && parseInt(splitQ[1]) > 1) {
      return parseInt(splitQ[1]);
    }
    return 1;
  }

  static getNotEqualIndex(condition) {
    return StringHelper.regexIndexOf(condition, /!=|<>/);
  }

  static optimizeWheres(wheres, isFirestore) {
    let queryableComparators = isFirestore
      ? ["==", "<", "<=", ">", ">="]
      : ["=="];

    //rearranges wheres so first statement is an equal, or error if no equals
    //firebase has no != method, so we'll grab whole collection, and filter on client
    const firstNotEqStatement = wheres[0];
    for (let i = 0; i < wheres.length; i++) {
      if (
        wheres[i].value != null &&
        queryableComparators.includes(wheres[i].comparator)
      ) {
        wheres[0] = wheres[i];
        wheres[i] = firstNotEqStatement;
        return wheres;
      }
    }

    wheres.unshift({ error: NO_EQUALITY_STATEMENTS });
    return wheres;
  }

  static checkForCrossDbQuery(db, collection) {
    let isFirestore = db.firestoreEnabled;
    if (/(db|firestore)\//i.test(collection)) {
      if (
        // only flip the db if it's not already enabled
        (isFirestore && /(db)\//i.test(collection)) ||
        (!isFirestore && /(firestore)\//i.test(collection))
      ) {
        isFirestore = !isFirestore;
      }
      collection = collection.substring(collection.indexOf("/") + 1);
    }
    return { collection, isFirestore };
  }
}
