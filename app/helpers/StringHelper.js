import React from "react";

export default class StringHelper {
  static regexIndexOf(string, regex, startpos) {
    var indexOf = string.substring(startpos || 0).search(regex);
    return indexOf >= 0 ? indexOf + (startpos || 0) : indexOf;
  }

  static replaceAll(string, regex, replacement) {
    return string.replace(new RegExp(regex, "g"), replacement);
  }

  static replaceAllIgnoreCase(string, regex, replacement) {
    return string.replace(new RegExp(regex, "g", "i"), replacement);
  }

  static regexLastIndexOf(string, regex, startpos) {
    regex = regex.global
      ? regex
      : new RegExp(
          regex.source,
          "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : "")
        );
    if (typeof startpos == "undefined") {
      startpos = this.length;
    } else if (startpos < 0) {
      startpos = 0;
    }
    var stringToWorkWith = string.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while ((result = regex.exec(stringToWorkWith)) != null) {
      lastIndexOf = result.index;
      regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
  }

  static getJsxWithNewLines(text) {
    return text.split("\n").map(function(item, key) {
      return (
        <span key={key}>
          {item}
          <br />
        </span>
      );
    });
  }

  static getParsedValue(stringVal, quotesMandatory) {
    if (!isNaN(stringVal)) {
      return parseFloat(stringVal);
    } else if (stringVal === "true" || stringVal === "false") {
      return stringVal === "true";
    } else if (stringVal === "null") {
      return null;
    } else if (quotesMandatory) {
      stringVal = stringVal.trim();
      if (stringVal.match(/^["|'].+["|']$/)) {
        return stringVal.replace(/["']/g, "");
      } else {
        return {
          FIRESTATION_DATA_PROP: stringVal
        };
      }
    } else {
      stringVal = stringVal.trim();
      return stringVal.replace(/["']/g, "");
    }
  }
}
