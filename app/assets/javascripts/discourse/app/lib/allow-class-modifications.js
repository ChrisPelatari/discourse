import guid from "pretty-text/guid";

/**
 * @typedef {Object} ClassModification
 * @property {Class} latestClass
 * @property {Class} boundaryClass
 */

/** @type Map<class, ClassModification> */
export const classModifications = new Map();

export const classModificationsKey = Symbol("CLASS_MODIFICATIONS_KEY");
export const stopSymbol = Symbol("STOP_SYMBOL");

export default function allowClassModifications(OriginalClass) {
  OriginalClass[classModificationsKey] = guid();

  // TODO: (perf) modify the constructor only after the first modification is done?
  return class extends OriginalClass {
    constructor() {
      if (arguments[arguments.length - 1] === stopSymbol) {
        super(...arguments);
        return;
      }

      const id = OriginalClass[classModificationsKey];
      const FinalClass =
        classModifications.get(id)?.latestClass || OriginalClass;

      return new FinalClass(...arguments);
    }
  };
}