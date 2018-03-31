export function subObject(object, startPropIndex, endPropIndex) {
  if (!object) {
    return null;
  } else if (startPropIndex == null) {
    return object;
  }

  let keys = Object.keys(object).slice(startPropIndex, endPropIndex);
  let newObj = {};
  keys &&
    keys.forEach(k => {
      newObj[k] = object[k];
    });
  return newObj;
}
