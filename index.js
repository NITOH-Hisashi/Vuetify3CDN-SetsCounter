        const { createVuetify } = Vuetify;
        const { createApp, ref, watch, onMounted } = Vue;
        const vuetify = createVuetify();
        createApp({
            setup() {
                const SECONDS_DEFAULT = 30;
                const LOCAL_STORAGE_KEY = 'countdownHistory';

                const drawer = ref(false);
                const sets = ref(1);
                const seconds = ref(SECONDS_DEFAULT);
                const loading = ref(false);
                const histories = ref([]);
                const dialog = ref(false);
                const number = ref(0);
                const circle = ref(null);
                const circleClass = ref('circle');
                const sortText = ref('Sort▼▲');

                let timer = null;
                let countdownInterval = null;
                let sortHistory = false;

                function deleteHistory() {
                    let result = confirm('履歴日時をブラウザから削除してよろしいですか？\n事前にエクスポートしておくと削除後にインポートが可能です');

                    if (result) {
                        histories.value = [];
                        saveHistory(histories.value);
                        //alert("削除しました");
                    } else {
                        //alert("削除しませんでした");
                    }
                }

                // ファイル名用の日時文字列
                function getFormattedDate(date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるので+1します
                    const day = String(date.getDate()).padStart(2, '0');

                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    const seconds = String(date.getSeconds()).padStart(2, '0');
                    const ms = String(date.getMilliseconds()).padStart(3, '0');

                    return `${year}${month}${day}T${hours}${minutes}${seconds}${ms}`;
                }

                function exportHistoryToCSV() {
                    // 履歴データを取得
                    const historiesData = histories.value;
                    // CSVのヘッダ
                    const csvHeader = 'TimeStamp\n';
                    // CSVデータの生成
                    const csvContent = historiesData.map(timestamp => {
                        const date = new Date(timestamp);
                        return date.toLocaleString();
                    }).join('\n');

                    // 完全なCSV内容
                    const csvFullContent = csvHeader + csvContent + '\n';

                    // CSVをBlobとして作成
                    const blob = new Blob([csvFullContent], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);

                    // ダウンロード用のリンクを作成
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'SetsCounter' + getFormattedDate(new Date()) + '.csv';

                    // ダウンロードをトリガー
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };

                function importHistoryFromCSV(event) {
                    const file = event.target.files[0];
                    if (!file) return;

                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const content = e.target.result;
                        const rows = content.split('\n').slice(1, content.length - 3); // ヘッダをスキップ

                        var newHistory = [];
                        rows.forEach(row => {
                            //console.log({ row });
                            const date = new Date(row).getTime();
                            if (date) {
                                //console.log({ date });
                                newHistory.push(date);
                            };
                        });
                        //console.log({ newHistory });

                        histories.value = [...histories.value, ...newHistory]; // 追加
                        //histories.value = newHistory; // 入れ替え
                        saveHistory(histories.value);
                    };
                    reader.readAsText(file);
                };

                // 日付ごとに履歴をグループ化する関数
                function groupHistoryByDate(histories) {
                    if (!histories) {
                        return [];
                    }
                    return histories.reduce((acc, timestamp) => {
                        const date = new Date(timestamp).toLocaleDateString();
                        if (!acc[date]) {
                            acc[date] = [];
                        };
                        acc[date].push(new Date(timestamp).toLocaleTimeString());
                        return acc;
                    }, {});
                };

                // ローカルストレージに配列を保存する関数
                function saveHistory(histories) {
                    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(histories));
                };

                // ローカルストレージから配列を読み込む関数
                function loadHistory() {
                    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
                };

                function compareNumbers() {
                    var compareNumber = 0;
                    var items = loadHistory(); // 履歴をロード
                    if (!items) {
                        return [];
                    };
                    //console.log({ items });

                    if (sortHistory) {
                        sortText.value = 'Sort▲'
                        compareNumber = -1;
                    } else {
                        sortText.value = 'Sort▼'
                        compareNumber = 1;
                    };
                    return items.sort(function (first, second) {
                        if (first < second) {
                            return compareNumber;
                        } else if (first > second) {
                            return -compareNumber;
                        } else {
                            return 0;
                        };
                    });
                };

                function btnSort() {
                    sortHistory = !sortHistory;
                    histories.value = compareNumbers();
                };

                function animateCircle() {
                    circleClass.value = 'circle reset';
                    //console.log({ circleClass });
                    //console.log({ circle });
                    void circle.offsetWidth; // Reflowをトリガー

                    setTimeout(() => {
                        circleClass.value = 'circle animate';
                        //console.log({ circleClass });
                    }, 50); // 50ミリ秒の待ち時間後に表示アニメーション動作
                };

                function setSeconds() {
                    number.value--
                    if (Number(number.value) > 0) {
                        animateCircle();
                    } else {
                        clearInterval(timer)
                        seconds.value = SECONDS_DEFAULT
                        sets.value++
                        loading.value = false
                    };
                };

                function start() {
                    if (isNaN(seconds.value) || seconds.value <= 0) {
                        alert('有効な秒数を入力してください');
                        return;
                    };

                    number.value = seconds.value;
                    loading.value = true;
                    dialog.value = true;
                    histories.value.push(new Date().getTime());
                    saveHistory(histories.value); // ローカルストレージに保存
                    histories.value = compareNumbers();
                    clearInterval(timer);
                    timer = setInterval(setSeconds, 1000);
                    animateCircle();
                };

                document.addEventListener('DOMContentLoaded', function () {
                    const secondsInput = document.getElementById('text-seconds');

                    secondsInput.addEventListener('keypress', function (event) {
                        if (event.key === 'Enter') {
                            start();
                        };
                    });
                });

                watch(() => {
                });

                onMounted(() => {
                    histories.value = compareNumbers();
                });

                return {
                    deleteHistory,
                    exportHistoryToCSV,
                    importHistoryFromCSV,
                    groupHistoryByDate,
                    sortText,
                    btnSort,
                    start,
                    circleClass,
                    circle,
                    drawer,
                    loading,
                    dialog,
                    sets,
                    seconds,
                    histories,
                    number,
                };
            },
        }).use(vuetify).mount('#app');
