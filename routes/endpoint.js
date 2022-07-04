const express = require('express')

const router = express.Router()

const { v4: uuid } = require('uuid')



router.post('/split-payments/compute', async (req, res, next) => {
    try {
        let splitBreakdown = []

        // let volatileData = {
        //     Id: "",
        //     Amount: 0,
        //     Currency: "NGN",
        //     CustomerEmail: "",
        //     SplitInfo: [{
        //         SplitType: "",
        //         SplitValue: 0,
        //         SplitEntityId: ""
        //     },]
        // }
        let volatileData = req.body
        if (volatileData.SplitInfo.length < 1 || volatileData.SplitInfo.length > 20) {
            res.status(403).json({
                success: false,
                message: 'Split info can contain a minimum of 1 and max of 20 entries'
            })
            return
        }
        let balance = req.body.Amount
        console.log(`Initial Balance: \n,${balance}`)
        volatileData.SplitInfo.filter(data => data.SplitType === 'FLAT').map((data) => {
            console.log(`FLATS`)
            balance -= data.SplitValue

            splitBreakdown.push({ splitEntryId: data.SplitEntityId, Amount: data.SplitValue })

            console.log(`Split amount for ${data.SplitEntityId} : ${data.SplitValue}\n
                        Balance after split calculation for ${data.SplitEntityId}:(${balance} -  ${data.SplitValue})\n ${balance}`)
        })
        volatileData.SplitInfo.filter(data => data.SplitType === 'PERCENTAGE').map((data) => {
            console.log(`PERCENTAGE`)
            // const perce =
            balance -= ((data.SplitValue / 100) * balance)
            splitBreakdown.push({ splitEntryId: data.SplitEntityId, Amount: data.SplitValue })

            console.log(`Split amount for ${data.SplitEntityId} : ${data.SplitValue}\n
                        Balance after split calculation for ${data.SplitEntityId}:(${balance} -  ${((data.SplitValue / 100) * balance)})\n${balance}`)
        })
        let totalRatio = 0;
        volatileData.SplitInfo.filter(data => data.SplitType === 'RATIO').forEach(e => totalRatio += e.SplitValue)
        // console.log()

        volatileData.SplitInfo.filter(data => data.SplitType === 'RATIO').map((data) => {

            console.log(`RATIO\n Total Ration: ${totalRatio}\nOpening Balance: ${balance}`)
            balance -= (data.SplitValue / totalRatio) * balance
            splitBreakdown.push({ splitEntryId: data.SplitEntityId, Amount: data.SplitValue })

            console.log(`${(data.SplitValue / totalRatio) * balance} Split amount for ${data.SplitEntityId} : ${data.SplitValue}\n
                        Balance after split calculation for ${data.SplitEntityId}:(${balance} -  ${(data.SplitValue / totalRatio) * balance})\n${balance}`)
        })
        if (balance < 0) {
            res.status(403).json({
                success: false,
                message: 'something is off witht the balance, check input'
            })
            return
        }
        console.log(`Final Balance: ${balance}`)
        const Id = uuid().split('-').join('')

        // console.log('helo')
        res.status(200).json({
            message: "something",
            data: { Id, Balance: balance, SplitBreakdown: splitBreakdown }
        })
    } catch (error) {
        console.log(error)
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
})

module.exports = router

