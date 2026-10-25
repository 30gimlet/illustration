async function downloadRandomSubset() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');

    // --- 1. 各パーツの枚数設定 ---
    const counts = {
        hair: 10,
        base: 1,
        dress: 8,
        bang: 6,
        face: 9,
        glass: 2  // glass0.png(なし) と glass1.png(あり)
    };

    const totalZips = 6;       // ZIPの数（6個）
    const itemsPerZip = 80;    // 1つのZIPあたりの枚数 (6 × 80 = 480枚)

    // --- 2. hair, dress, bang の「すべての組み合わせ（480通り）」を作る ---
    let allTrios = [];
    for (let h = 1; h <= counts.hair; h++) {
        for (let d = 1; d <= counts.dress; d++) {
            for (let bg = 1; bg <= counts.bang; bg++) {
                allTrios.push({ h, d, bg });
            }
        }
    }

    // --- 3. dress（服）の偏りを防ぐためのシャッフル＆グループ分け ---
    // ドレスごとにトリオを分類する
    let dressGroups = {};
    for (let d = 1; d <= counts.dress; d++) {
        dressGroups[d] = allTrios.filter(trio => trio.d === d);
        // それぞれのドレスグループ内をランダムにシャッフル
        dressGroups[d].sort(() => Math.random() - 0.5);
    }

    // 6つのZIPそれぞれに、各ドレスが均等に割り振られるように順番に配分する
    let zipBuckets = Array.from({ length: totalZips }, () => []);

    for (let i = 0; i < totalZips; i++) {
        for (let d = 1; d <= counts.dress; d++) {
            // 1つのZIPに対して、各ドレスから「10枚ずつ」取り出して割り当てる（8ドレス × 10枚 = 80枚）
            // ※ 480通り ÷ 6ZIP ＝ 各ZIPに80枚。8ドレスなので1ドレスあたり10枚ずつで綺麗に割り切れます
            const takeCount = itemsPerZip / counts.dress; // 10枚
            const items = dressGroups[d].splice(0, takeCount);
            zipBuckets[i].push(...items);
        }
        // ZIPごとの中でも順番が偏らないようにシャッフル
        zipBuckets[i].sort(() => Math.random() - 0.5);
    }

    // --- 4. 6つのZIPファイルをそれぞれ作成して順番にダウンロード ---
    for (let zipIndex = 0; zipIndex < totalZips; zipIndex++) {
        const zip = new JSZip();
        const selectedTrios = zipBuckets[zipIndex];
        let count = 0;

        for (const trio of selectedTrios) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // face（1 〜 9）をランダムに選択
            const f = Math.floor(Math.random() * counts.face) + 1;

            // glassの確率調整（70%の確率で 0 / 30%の確率で 1）
            const glassWeights = { 0: 70, 1: 30 };
            const totalWeight = glassWeights[0] + glassWeights[1];
            const rand = Math.random() * totalWeight;
            let g = (rand < glassWeights[0]) ? 0 : 1;

            const combo = {
                h: trio.h,
                b: 1, // baseは1種固定
                d: trio.d,
                bg: trio.bg,
                f: f,
                g: g
            };

            // 下から順番に重ねる配列を作成
            const sources = [
                `images/hair/hair${combo.h}.png`,
                `images/base/base.png`,
                `images/dress/dress${combo.d}.png`,
                `images/bang/bang${combo.bg}.png`,
                `images/face/face${combo.f}.png`
            ];

            // glass0以外（メガネあり）の場合のみ、配列にメガネを追加する
            if (combo.g !== 0) {
                sources.push(`images/glass/glass${combo.g}.png`);
            }

            // 画像の読み込みと描画
            for (const src of sources) {
                try {
                    const img = await loadImage(src);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                } catch (e) {
                    console.error("画像の読み込みに失敗しました: " + src);
                }
            }

            // キャンバスの画像をデータに変換してZIPに追加
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            count++;
            // 各ZIP内でファイル名が 1〜80 になるようにする
            zip.file(`character_${count}.png`, blob);
        }

        // このZIPをダウンロード
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `characters_part_${zipIndex + 1}.zip`;
        
        // 少し遅延を入れながら自動ダウンロードを実行（ブラウザのブロックを防ぐため）
        await new Promise(resolve => setTimeout(resolve, 500 * zipIndex));
        link.click();
    }

    alert(`すべての処理が完了しました！6つのZIPファイルが順番にダウンロードされます。`);
}

// 画像を非同期で読み込む補助関数
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = src;
    });
}
