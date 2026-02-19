import admin from 'firebase-admin'
import { exp } from 'firebase/firestore/pipelines'

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCnsADzYYR2A7RY\njQxL3hyB7/cJeqsULMf16epPKBj4s8Xw1VSa+cxKe6u6eBkWBcZBIDoZxa/z5Wdt\nKSlE2HA/YF73+LV5R3tE32I9bvhyWqyY9AfyCLxqwXCaswK3o0yxIXy5aV+ZDCrc\nqyzJXnEbiDAhBNLoxfqxXbOWJileOwme8vrAmJIEkInAVS7CnAKdYPh0xoXu8XDe\nHfIjGPNTWWk0w3ESOJFaCelHo9h+pr8L7NfA+j9VxXUW5WIPwvLeubMIGTmRbn04\nA4GmpTZ6soR5Gh3O5Zd3IGkhXEjfGKo1PBoNLvVPsjSxRmpH+R8BH55sS4REyaPK\nV75DetLJAgMBAAECggEAAfUW/cBMqIgAiewTkaslEAs6Cf1Jk/G139P8LTJdoEGQ\n9O+4jhqOXOw2o/WU7WHh3469vuFE3Yb2/xo05h3UqZi5YxGfJKxF7xbgcbEi60rN\nqvdmRFf/wwtBAj1GsdgRJBws9YkaWZH/yhWhbzRQA69CSJBi2d69v2ZFm2IUp4nq\nCPpHQ7ev+skuAi+/LXuqd+Q/YJdl8H14RT12k3XfZY3JF21K/a+J4ApHHIOPKof9\nq0hCl9zeZYLVMksLiDCVdNQq16dmrhDci3/ZKIpoidEloIYeynbePnH9wCWEZTE8\nQugPH1TZ2sL9o2FCyO/MVHNUqf+ph8EqONWWgTYmdQKBgQDc+bw31mfsoT3UWocc\noGgTle+zFIYEUI2lsj4mnGCpxwOESs7EJlcQitrdk4m5IP9mTcWbJFwiWzPRW8Ia\nFg29819KOlTny6zQtCJuywZuX2j8sSzbWI/9CkYKJphLm0FlL/G+NSWIAokCozjX\neDA9DutrPFatHJ6pkg7tIpzXQwKBgQDCRBAyWfndyKp0BSz8o8LXauz/fXDaAE1z\n7WKzdSsd5vZOQSsVAHONqqgih17UtfI9NfpvxUoIGp4egH6yUAGfiBdBte0IqiKD\n5yLHGVbOuVfFdwdBmOqdqq7NXWUaz4J0KFILu++Y7y2/Ji5QJu5F65/qdcl+rB5E\n2E5kb/UvAwKBgBksch7CVDCG5e5NKds/AtxIVnhGPEY9jwVzWtU3N2PgAiyOASQj\nYgPGbcyURDpM4gubjIlyCPT5Atw04dXq8UHUeeSQ5J9LerKD8vBAPMlSITm4TW3n\nlu+yvevmHa9vTnHill2e3Fm0QDuGsLELRiOOkY8z3oP2ILUcqIqnSMrVAoGAUQAM\nONJnauBGokWeMmEd1rBQzV7CdUN3CAVNCEKsjbVFse9eRU2A4OrtXChRlCOhM4CU\nQZJjgemHUHSHX1YYtyoJeG6gvOIjrhfr2lRoa53ASSeOMP3PpZoLdLmidIFdhY1i\nWF4uUvg3fOIwoV76LtFGRn6CW3zsygve8+Xyt30CgYAe8mGKRCdy9XO9yK4N1grC\nWTxp67UjSpG4FpeN+K3YpdETUZudU3M9W9KWtRHQzJe3NAlHQO9rJU4XkbQcIxOk\n5eeX30hikRm7IkdcYMY8oOTWTYh2wwZzUYolbV3yI0W8C0HfTvKROqcM3TV1lbU7\nfvJ6ohpBjMzTz+R4/KK3Tg==\n-----END PRIVATE KEY-----\n"
        })
        
    })
}

export const adminAuth = admin.auth();