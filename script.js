async function downloadAllPatterns() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const zip = new JSZip(); // ZIPファイルを作る準備

    const counts = {
        base: 1,
        mouth: 3,
        eyes: 2,
        eyebrows: 2
    };

    let count = 0;
    // 全組み合わせをループで回す（入れ子構造）
    for (let b = 1; b <= counts.base; b++) {
        for (let m = 1; m <= counts.mouth; m++) {
            for (let e = 1; e <= counts.eyes; e++) {
                for (let eb = 1; eb <= counts.eyebrows; eb++) {
                    
                    // 1. キャンバスをクリアして合成
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    const sources = [
                        `images/base/base${b}.png`,
                        `images/mouth/mouth${m}.png`,
                        `images/eyes/eyes${e}.png`,
                        `images/eyebrows/eyebrows${eb}.png`
                    ];

                    for (const src of sources) {
                        const img = await loadImage(src);
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    }

                    // 2. 現在のキャンバスの状態をデータ（Blob）にする
                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    
                    // 3. ZIPの中に保存（ファイル名を「result_1.png」のように連番にする）
                    count++;
                    zip.file(`character_${count}.png`, blob);
                    
                    console.log(`${count}枚目の生成完了...`);
                }
            }
        }
    }

    // 4. ZIPを生成してダウンロード
    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "all_characters.zip";
    link.click();
    
    alert("全ての組み合わせ（" + count + "通り）のZIP作成が完了しました！");
}

// loadImage関数は前回と同じものを使用
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}
