"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const luxon_1 = require("luxon");
class ReservationServices {
    constructor(Equipment) {
        this.Equipment = Equipment;
    }
    createAction(actualActions) {
        const newActionDay = luxon_1.DateTime.local({ zone: "America/Fortaleza" }).toFormat("dd/MM/yyyy");
        const newActionTime = luxon_1.DateTime.local({ zone: "America/Fortaleza" }).toFormat("HH:mm:ss");
        let newAction;
        if (actualActions == null) {
            newAction = {
                [newActionDay]: {
                    [newActionTime]: "Entrada"
                }
            };
            return {
                newAction: newAction,
                action: "Entrada",
                newActionDateTime: { day: newActionDay, time: newActionTime }
            };
        }
        else {
            const userActions = Object.entries(actualActions[newActionDay]);
            let newerAction;
            let lastAction;
            userActions.forEach((action) => {
                const actionTime = luxon_1.DateTime.fromFormat(action[0], "HH:mm:ss");
                if (!newerAction) {
                    newAction = actionTime;
                    lastAction = action[1];
                }
                else {
                    if (actionTime.toMillis() >= newerAction.toMillis()) {
                        newerAction = actionTime.toFormat("HH:mm:ss");
                        lastAction = action[1];
                    }
                }
            });
            const action = lastAction == "Entrada" ? "Saida" : "Entrada";
            newAction = {
                ...actualActions,
                [newActionDay]: {
                    ...actualActions[newActionDay] || {},
                    [newActionTime]: action
                }
            };
            return {
                newAction: newAction,
                action: action,
                newActionDateTime: { day: newActionDay, time: newActionTime }
            };
        }
    }
}
exports.default = ReservationServices;
