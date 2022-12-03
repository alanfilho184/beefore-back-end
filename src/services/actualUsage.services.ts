import { DateTime as time } from 'luxon'

export default class ReservationServices {
    Relatory: any
    constructor(Relatory: any) {
        this.Relatory = Relatory
    }

    async getAverageTimeUsage() {
        const relatorys = await this.Relatory.getAll()

        const weekRelatorys = new Map()
        relatorys.forEach((relatory: Relatory) => {
            for (let d = 0; d < 7; d++) {
                const day = time.fromMillis(time.now().toMillis() - 24 * 60 * 60 * 1000 * d).toFormat('dd/LL/yyyy')

                Object.keys(relatory.actions).forEach(dayAction => {
                    if (dayAction == day) {
                        if (weekRelatorys.has(day)) {
                            weekRelatorys.set(day, {
                                ...weekRelatorys.get(day),
                                [relatory.userid]: relatory.actions[dayAction],
                            })
                        } else {
                            weekRelatorys.set(day, {
                                [relatory.userid]: relatory.actions[dayAction],
                            })
                        }
                    }
                })
            }
        })

        let average = 0
        let samples = 0
        const weekAverage = new Map()
        weekRelatorys.forEach((dayRelatorys: Map<string, object>, day: string) => {
            let dayAverage = 0
            let daySamples = 0
            const userActionsArray = Object.entries(dayRelatorys)

            for (const x in userActionsArray) {
                const actionsArray = Object.entries(userActionsArray[x][1])

                for (const i in actionsArray) {
                    try {
                        if (actionsArray[i][1] == 'Entrada' && actionsArray[parseInt(i) + 1][1] == 'Saida') {
                            const inTime = time.fromFormat(actionsArray[i][0], 'HH:mm:ss')
                            const outTime = time.fromFormat(actionsArray[parseInt(i) + 1][0], 'HH:mm:ss')

                            average += outTime.toMillis() - inTime.toMillis()
                            samples += 1

                            dayAverage += outTime.toMillis() - inTime.toMillis()
                            daySamples += 1
                        }
                    } catch (err) {
                        null
                    }
                }
            }

            dayAverage = dayAverage / daySamples / 1000 / 60 / 60

            weekAverage.set(day, {
                average: dayAverage,
                samples: daySamples,
                users: userActionsArray.length,
            })
        })

        average = average / samples / 1000 / 60 / 60

        let mostUsedDay = weekAverage.keys().next().value
        weekAverage.forEach((statistics, day) => {
            const dayStatistic = statistics.average * statistics.users
            const mostUsedStatistic = weekAverage.get(mostUsedDay).average * weekAverage.get(mostUsedDay).users

            if (dayStatistic > mostUsedStatistic) {
                mostUsedDay = day
            }
        })

        return {
            totalAverage: {
                average: average,
                samples: samples,
                users: relatorys.length,
            },
            weekAverage: weekAverage,
            mostUsedDay: mostUsedDay,
        }
    }
}
