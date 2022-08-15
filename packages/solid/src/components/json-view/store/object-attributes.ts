import EventEmitter from "events";

import { toType } from "../helpers/util";

interface ActionType {
  rjvId: string;
  data?: RequestType & { updatedSrc?: any };
  name:
    | "RESET"
    | "VARIABLE_UPDATED"
    | "VARIABLE_REMOVED"
    | "VARIABLE_ADDED"
    | "ADD_VARIABLE_KEY_REQUEST";
}

interface RequestType {
  name: string | null;
  namespace: Array<string | number>;
  newValue: any;
  existingValue: any;
  variableRemoved: boolean;
}

class ObjectAttributes extends EventEmitter {
  objects: any = {};
  set = (rjvId: string | number, name: string | number, key: string | number, value: any) => {
    if (this.objects[rjvId] === undefined) {
      this.objects[rjvId] = {};
    }
    if (this.objects[rjvId][name] === undefined) {
      this.objects[rjvId][name] = {};
    }
    this.objects[rjvId][name][key] = value;
  };

  get = (
    rjvId: string | number,
    name: string | number,
    key: string | number,
    defaultValue?: any
  ) => {
    if (
      this.objects[rjvId] === undefined ||
      this.objects[rjvId][name] === undefined ||
      this.objects[rjvId][name][key] == undefined
    ) {
      return defaultValue;
    }
    return this.objects[rjvId][name][key];
  };

  handleAction = (action: ActionType) => {
    const { rjvId, name } = action;
    switch (name) {
      case "RESET":
        this.emit("reset-" + rjvId);
        break;
      case "VARIABLE_UPDATED":
        if (action.data) {
          action.data.updatedSrc = this.updateSrc(rjvId, action.data);
        }
        this.set(rjvId, "action", "variable-update", {
          ...action.data,
          type: "variable-edited",
        });
        this.emit("variable-update-" + rjvId);
        break;
      case "VARIABLE_REMOVED":
        if (action.data) {
          action.data.updatedSrc = this.updateSrc(rjvId, action.data);
        }

        this.set(rjvId, "action", "variable-update", {
          ...action.data,
          type: "variable-removed",
        });
        this.emit("variable-update-" + rjvId);
        break;
      case "VARIABLE_ADDED":
        if (action.data) {
          action.data.updatedSrc = this.updateSrc(rjvId, action.data);
        }
        this.set(rjvId, "action", "variable-update", {
          ...action.data,
          type: "variable-added",
        });
        this.emit("variable-update-" + rjvId);
        break;
      case "ADD_VARIABLE_KEY_REQUEST":
        this.set(rjvId, "action", "new-key-request", action.data);
        this.emit("add-key-request-" + rjvId);
        break;
    }
  };

  updateSrc = (rjvId: string, request: RequestType) => {
    const { name, namespace, newValue, variableRemoved } = request;

    namespace.shift();

    //deepy copy src
    const src = this.get(rjvId, "global", "src");

    //deep copy of src variable
    let updatedSrc = this.deepCopy(src, [...namespace]);
    //point at current index
    let walk = updatedSrc;
    for (const idx of namespace) {
      walk = walk[idx];
    }

    if (variableRemoved && name) {
      if (toType(walk) == "array") {
        walk.splice(name, 1);
      } else {
        delete walk[name];
      }
    } else {
      //update copied variable at specified namespace
      if (name !== null) {
        walk[name] = newValue;
      } else {
        updatedSrc = newValue;
      }
    }

    this.set(rjvId, "global", "src", updatedSrc);

    return updatedSrc;
  };

  deepCopy = (src: any, copyNamespace: Array<string | number>) => {
    const type = toType(src);
    let result;
    const idx = copyNamespace.shift();

    if (type == "array") {
      result = [...src];
    } else if (type == "object") {
      result = { ...src };
    }
    if (idx !== undefined) {
      result[idx] = this.deepCopy(src[idx], copyNamespace);
    }
    return result;
  };
}

export const attributeStore = new ObjectAttributes();
