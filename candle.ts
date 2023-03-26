const howManyCandlesCallback = (dayNumber: number, callback: (err: string | null, dayNumber?: number) => void) => {
    if (dayNumber < 1) {
        return callback('day cannot be smaller than 1');
    }

    if (dayNumber > 8) {
        return callback('No Isro Chag for Hannukah!');
    }

    return callback(null, dayNumber + 1);
}

const howManyCandles = (dayNumber: number) => new Promise<number | undefined>((resolve, reject) => {
    howManyCandlesCallback(dayNumber, (err, result) => {
        return err ? reject(err) : resolve(result);
    })
})

const promises = () => {
    const promises = [];

    for (let i = 1; i <= 8; i++) {
        promises.push(howManyCandles(i));
    }

    const numOfCandles = Promise.all(promises).then((values: (number | undefined)[]) => {
        const numOfCandles = values.reduce((acc, curr) => {
            if (typeof acc === "number" && typeof curr === "number") return acc + curr;
            return 0;
        });

        console.log(`Num of candles in promises: ${numOfCandles}!`)
    })
}

// async / await
const async = async () => {
    const promises = [];

    for (let i = 1; i <= 8; i++) {
        promises.push(howManyCandles(i));
    }

    const numOfCandles = (await Promise.all(promises)).reduce((acc, curr) => {
        if (typeof acc === "number" && typeof curr === "number") return acc + curr;
        return 0;
    });
    console.log(`Num of candles in async: ${numOfCandles}!`)
}

promises();

