export function convertJsonToDbConfig(details) {
  details = details.substring(details.indexOf("{"));
  details = details.substring(0, details.indexOf("}") + 1);
  details = details.replace(/(['"])?([a-z0-9A-Z_]+)(['"])?:(?!\/)/g, '"$2": ');
  return JSON.parse(details);
}
