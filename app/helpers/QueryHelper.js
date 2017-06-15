import StringHelper from './StringHelper';
import UpdateHelper from './UpdateHelper';
const ServiceAccount = require('electron').remote.require('./ServiceAccount');
import * as admin from "firebase-admin";
const NO_EQUALITY_STATEMENTS = "NO_EQUALITY_STATEMENTS";
const SELECT_STATEMENT = "SELECT_STATEMENT";
const UPDATE_STATEMENT = "UPDATE_STATEMENT";
const INSERT_STATEMENT = "INSERT_STATEMENT";
const DELETE_STATEMENT = "DELETE_STATEMENT";

export default class QueryHelper {
  static getRootKeysPromise(database) {
    if (!database) { return null; }
    const url = "https://" + database.config.projectId + ".firebaseio.com//.json?shallow=true";
    return fetch(url).then(response => {
      return response.json()
    })
  }

  static getFirebaseApp(dbUrl) {
    let apps = admin.apps;
    for (let i = 0; i < apps.length; i++) {
      if (apps[i].name === dbUrl) {
        return apps[i];
      }
    }
    return null;
  }

  static executeQuery(query, database, callback, commitResults) {
    let app = this.getFirebaseApp(database.url);
    if (!app) {
      app = admin.initializeApp({
        credential: admin.credential.cert(database.serviceKey),
        databaseURL: database.url
      }, database.url);
    }

    let db = app.database();
    let ref = db.ref("/");
    ref.off("value");
    query = this.formatAndCleanQuery(query);
    const statementType = this.determineQueryType(query);
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
    query = StringHelper.replaceAll(query, /(\/\/|--).+/, "");
    query = query.replace(/\r?\n|\r/g, " ");
    return query;
  }

  static executeInsert(query, db, callback, commitResults) {
    const collection = this.getCollection(query, INSERT_STATEMENT);
    const that = this;
    let insertObject = this.getObjectFromInsert(query);
    const path = collection + "/";
    if (commitResults) {
      UpdateHelper.pushObject(db, path, insertObject);
    }
    let results = {
      statementType: INSERT_STATEMENT,
      payload: insertObject,
      path: path
    }
    callback(results);
  }

  static executeDelete(query, db, callback, commitResults) {
    const collection = this.getCollection(query, DELETE_STATEMENT);
    const that = this;
    this.getWheres(query, db, (wheres) => {
      this.getDataForSelect(db, collection, null, wheres, (dataToAlter => {
        if (dataToAlter && commitResults) {
          Object.keys(dataToAlter.payload).forEach(function (objKey, index) {
            const path = collection + "/" + objKey;
            UpdateHelper.deleteObject(db, path);
          })
        }
        let results = {
          statementType: DELETE_STATEMENT,
          payload: dataToAlter.payload,
          firebaseListener: dataToAlter.firebaseListener,
          path: collection
        }
        callback(results);
      }));
    });
  }

  static executeSelect(query, db, callback) {
    const collection = this.getCollection(query, SELECT_STATEMENT);
    const selectedFields = this.getSelectedFields(query);
    this.getWheres(query, db, (wheres) => {
      this.getDataForSelect(db, collection, selectedFields, wheres, callback);
    });
  }

  static executeUpdate(query, db, callback, commitResults) {
    const collection = this.getCollection(query, UPDATE_STATEMENT);
    const sets = this.getSets(query);
    if (!sets) { return null; }
    const that = this;
    this.getWheres(query, db, (wheres) => {
      this.getDataForSelect(db, collection, null, wheres, dataToAlter => {
        let data = dataToAlter.payload;
        Object.keys(data).forEach(function (objKey, index) {
          that.updateItemWithSets(data[objKey], sets);
          const path = collection + "/" + objKey;
          if (commitResults) {
            UpdateHelper.updateFields(db, path, data[objKey], Object.keys(sets));
          }
        })
        let results = {
          statementType: UPDATE_STATEMENT,
          payload: data,
          firebaseListener: dataToAlter.firebaseListener,          
          path: collection
        }
        callback(results);
      })
    });
  }

  static getDataForSelect(db, collection, selectedFields, wheres, callback) {
    console.log("getData (collection, selectedFields, wheres):", collection, selectedFields, wheres)
    var ref = db.ref(collection);
    let results = { queryType: SELECT_STATEMENT, path: collection, firebaseListener: ref };
    if (!selectedFields && !wheres) {
      ref = db.ref(collection);
      ref.on("value", snapshot => {
        results.payload = snapshot.val();
        return callback(results);
      })
    } else if (!wheres) {
      ref.on("value", snapshot => {
        results.payload = snapshot.val();
        if (selectedFields) {
          results.payload = this.removeNonSelectedFieldsFromResults(results.payload, selectedFields);
        }
        return callback(results);
      })
    } else {
      let mainWhere = wheres[0];
      if (mainWhere.error && mainWhere.error === NO_EQUALITY_STATEMENTS) {
        ref.on("value", snapshot => {
          results.payload = this.filterWheresAndNonSelectedFields(snapshot.val(), wheres, selectedFields);
          return callback(results);
        })
      }
      else {
        ref.orderByChild(mainWhere.field).equalTo(mainWhere.value).on("value", snapshot => {
          results.payload = this.filterWheresAndNonSelectedFields(snapshot.val(), wheres, selectedFields);
          console.log("select results: ", results)

          return callback(results);
        })
      }
    }
  }

  static updateItemWithSets(obj, sets) {
    Object.keys(sets).forEach(function (objKey, index) {
      obj[objKey] = sets[objKey];
    })
    return obj;
  }

  static determineQueryType(query) {
    let q = query.trim();
    let firstTerm = q.split(" ")[0].trim().toLowerCase();
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
    let wheresArr = query.substring(whereIndexStart + 5).split(" and ");
    wheresArr[wheresArr.length - 1] = wheresArr[wheresArr.length - 1].replace(";", "");
    let wheres = [];
    wheresArr.forEach(where => {
      where = StringHelper.replaceAllIgnoreCase(where, "not like", "!like");
      let eqCompAndIndex = this.determineComparatorAndIndex(where);
      let whereObj = {
        field: StringHelper.replaceAll(where.substring(0, eqCompAndIndex.index).trim(), "\\.", "/"),
        comparator: eqCompAndIndex.comparator
      }
      let val = StringHelper.getParsedValue(where.substring(eqCompAndIndex.index + eqCompAndIndex.comparator.length).trim());
      if (typeof val === "string" && val.charAt(0) === "(" && val.charAt(val.length - 1) === ")") {
        // let cleanedQu
        this.executeSelect(val.substring(1, val.length - 1), db, (results) => {
          whereObj.value = results.payload;
          wheres.push(whereObj);
          if (wheresArr.length === wheres.length) {
            return callback(this.optimizeWheres(wheres));
          }
        })
      } else {
        whereObj.value = val;
        wheres.push(whereObj);
        if (wheresArr.length === wheres.length) {
          return callback(this.optimizeWheres(wheres));
        }
      }
    })
  }

  static getSets(query) {
    const setIndexStart = query.indexOf(" set ") + 1;
    if (setIndexStart < 1) { return null; }
    const whereIndexStart = query.indexOf(" where ") + 1;
    let setsArr;
    if (whereIndexStart > 0) {
      setsArr = query.substring(setIndexStart + 3, whereIndexStart).split(", ");
    } else {
      setsArr = query.substring(setIndexStart + 3).split(", ");
      setsArr[setsArr.length - 1] = setsArr[setsArr.length - 1].replace(";", "");
    }
    let sets = {};
    setsArr.forEach(item => {
      let keyValSplit = item.split("=");
      if (keyValSplit.length === 2) {
        sets[keyValSplit[0].trim()] = StringHelper.getParsedValue(keyValSplit[1].trim());
      }
    })
    return sets;
  }

  static filterWheresAndNonSelectedFields(results, wheres, selectedFields) {
    if (wheres.length > 1) {
      results = this.filterResultsByWhereStatements(results, wheres.slice(1));
    }
    if (selectedFields) {
      results = this.removeNonSelectedFieldsFromResults(results, selectedFields);
    }
    return results;
  }

  static getCollection(q, statementType) {
    let query = q.replace(/\(.*\)/, '').trim();
    let terms = query.split(" ");
    if (statementType === UPDATE_STATEMENT) {
      return StringHelper.replaceAll(terms[1], /\./, "/");
    } else if (statementType === SELECT_STATEMENT) {
      if (terms.length === 2 && terms[0] === "from") { return StringHelper.replaceAll(terms[1], ".", "/"); }
      else if (terms.length === 1) {
        let collection = terms[0].replace(";", "");
        return StringHelper.replaceAll(collection, /\./, "/");
      }
      let collectionIndexStart = query.indexOf("from ") + 5;
      if (collectionIndexStart < 5) { return StringHelper.replaceAll(terms[0], /\./, "/"); }
      let trimmedCol = query.substring(collectionIndexStart).trim();
      let collectionIndexEnd = trimmedCol.match(/\ |;|$/).index;
      let collection = trimmedCol.substring(0, collectionIndexEnd);
      return StringHelper.replaceAll(collection, /\./, "/");
    } else if (statementType === INSERT_STATEMENT) {
      return StringHelper.replaceAll(terms[2], /\./, "/");
    } else if (statementType === DELETE_STATEMENT) {
      let index = terms.length > 2 ? 2 : 1;
      let term = StringHelper.replaceAll(terms[index], /;/, "");
      return StringHelper.replaceAll(term, /\./, "/");
    }
    return null;
  }

  static getSelectedFields(q) {
    let query = q.trim();
    if (!query.startsWith("select ") || query.startsWith("select *")) {
      return null;
    }
    let regExp = /(.*select\s+)(.*)(\s+from.*)/;
    let froms = query.replace(regExp, "$2");
    if (froms.length === query.length) { return null; }
    let fields = froms.split(",");
    if (fields.length === 0) { return null; }
    let selectedFields = {};
    fields.map(field => {
      selectedFields[field.trim()] = true;
    })
    return selectedFields;
  }

  static getObjectFromInsert(query) {
    let valuesStr = query.match(/(values).+\);/)[0];
    let keysStr = query.substring(query.indexOf("(") + 1, query.indexOf(")"));
    let keys = keysStr.split(",");
    let values = valuesStr.substring(valuesStr.indexOf("(") + 1, valuesStr.indexOf(")")).split(",");
    if (!keys || !values || keys.length !== values.length) {
      throw "Badly formatted insert statement";
    }
    let insertObject = {};
    keys.forEach((key, i) => {
      insertObject[StringHelper.getParsedValue(key.trim())] = StringHelper.getParsedValue(values[i].trim());
    });
    return insertObject;
  }

  static removeNonSelectedFieldsFromResults(results, selectedFields) {
    if (!results || !selectedFields) {
      return results;
    }
    Object.keys(results).forEach(function (objKey, index) {
      if (typeof results[objKey] !== "object") {
        if (!selectedFields[objKey]) {
          delete results[objKey];
        }
      }
      else {
        Object.keys(results[objKey]).forEach(function (propKey, index) {
          if (!selectedFields[propKey]) {
            delete results[objKey][propKey];
          }
        });
      }
    });
    return Object.keys(results).length === 1 ? results[Object.keys(results)[0]] : results;
  }

  static filterResultsByWhereStatements(results, whereStatements) {
    if (!results) {
      return null;
    }

    let returnedResults = {};
    let nonMatch = {};
    for (let i = 0; i < whereStatements.length; i++) {
      let indexOffset = 1;
      let where = whereStatements[i];
      const that = this;
      Object.keys(results).forEach(function (key, index) {
        let thisResult = results[key][where.field];
        if (!that.conditionIsTrue(thisResult, where.value, where.comparator)) {
          nonMatch[key] = results[key];
        }
      });
    }
    if (nonMatch) {
      Object.keys(results).forEach(function (key, index) {
        if (!nonMatch[key]) {
          returnedResults[key] = results[key];
        }
      });
      return returnedResults;
    } else {
      return results;
    }

  }

  static conditionIsTrue(val1, val2, comparator) {
    switch (comparator) {
      case "=":
        return this.determineEquals(val1, val2);
      case "!=":
        return !this.determineEquals(val1, val2);
      case "<=":
        return val1 <= val2;
      case "<":
        return val1 < val2;
      case ">=":
        return val1 >= val2;
      case ">":
        return val1 > val2;
      case "like":
        return this.determineStringIsLike(val1, val2);
      case "!like":
        return !this.determineStringIsLike(val1, val2);
      default:
        return false;
    }
  }

  static determineEquals(val1, val2) {
    val1 = (typeof val1 == "undefined" || val1 == "null") ? null : val1;
    val2 = (typeof val2 == "undefined" || val2 == "null") ? null : val2;
    return val1 === val2;
  }

  static determineStringIsLike(val1, val2) {
    //TODO: LIKE fails on reserved regex characters (., +, etc)
    let regex = StringHelper.replaceAll(val2, '%', '.*');
    regex = StringHelper.replaceAll(regex, '_', '.{1}');
    // regex= StringHelper.replaceAll(regex,'\+','\+');
    let re = new RegExp("^" + regex + "$", "g");
    return re.test(val1);
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

    return { comparator: "=", index: where.indexOf("=") };
  }

  static getNotEqualIndex(condition) {
    return StringHelper.regexIndexOf(condition, /!=|<>/);
  }

  static optimizeWheres(wheres) {
    //rearranges wheres so first statement is an equal, or error if no equals 
    //firebase has no != method, so we'll grab whole collection, and filter on client    
    const firstNotEqStatement = wheres[0];
    for (let i = 0; i < wheres.length; i++) {
      if (wheres[i].value != null && wheres[i].comparator === "=") {
        wheres[0] = wheres[i];
        wheres[i] = firstNotEqStatement;
        return wheres;
      }
    }

    wheres.unshift({ error: NO_EQUALITY_STATEMENTS });
    return wheres;
  }

}
