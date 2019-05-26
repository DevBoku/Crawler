const cron = require('node-cron');
const axios = require('axios');
const request = require('request');
const qs = require('querystring');

const URL = 'https://www.speakingmax.com/Apply/ajaxPackage';

const LINE_URL = 'https://notify-api.line.me/api/notify';
const LINE_TOKEN = 'Bearer qlh8qFs3SZLDo7xgfba5eNwdFV2PnXtKBWfHrWlD1m6';

const config = {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    }
};

const sendLintNotify = (result = 'default') => {
    let message;
    if (!result) {
        message = 'Error 발생, 확인 바랍니다.';
    } else {
        message = `
            재고가 풀렸습니다.
            제품 : ${result.retPackageIdx === 884 ? '11인치 WiFi+Cellular 256GB' : '11인치 WiFi+Cellular 512GB'}
            색상 : ${result.retColor === 'gray' ? '스페이스 그레이' : '실버'},
            재고량 : ${result.retDisplayCode},
            주소 : https://www.speakingmax.com/order/devicePackageView_noLeft.php?idx=35
        `;
    }

    axios.post(
        LINE_URL,
        qs.stringify({ message }), {
            headers: {'Authorization': LINE_TOKEN
            }
        })
        .then(response => {
            console.log(response.data);
        });
};

cron.schedule('* * * * *', () => {
    console.log('running a task every minute');

    const SIZE_KEY = 'depth3';
    const COLOR_KEY = 'depth4';

    const sizes = ['05_{WiFi+Cellular} (256GB)', '06_{WiFi+Cellular} (512GB)'];
    const colors = ['01_{실버}', '02_{스페이스 그레이}'];

    for (size of sizes) {
        for (color of colors) {
            const requestBody = {
                dpIdx: '35',
                depthNum: 4,
                depth1: '01_스피킹맥스 1년 이용권',
                depth2: '01_아이패드 프로 {11 (애플펜슬형)}',
            };

            requestBody[SIZE_KEY] = size;
            requestBody[COLOR_KEY] = color;

            axios.post(URL, qs.stringify(requestBody), config)
                .then((result) => {
                    const { data } = result;
                    console.log(data);
                    if (data.retDisplayType.toLowerCase() === 'count') {
                        sendLintNotify(data);
                    } else {
                        sendLintNotify(data);
                    }
                });
        }
    }
});