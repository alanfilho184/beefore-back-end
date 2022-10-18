export default class ReservationServices {
    Equipment: any;
    constructor(Equipment: any);
    createAction(actualActions: Actions): {
        newAction: any;
        action: string;
        newActionDateTime: {
            day: string;
            time: string;
        };
    };
}
