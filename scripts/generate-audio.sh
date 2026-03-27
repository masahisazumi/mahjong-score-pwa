#!/bin/bash

# 麻雀点数音声ファイル生成スクリプト
# macOS sayコマンド + ffmpegを使用
#
# 使用方法: ./scripts/generate-audio.sh
# 必要条件: macOS, ffmpeg (brew install ffmpeg)
#
# 生成ファイル:
#   0本場: {player}_{type}_{id}.mp3           (100ファイル)
#   1-10本場: {player}_{type}_{id}_h{n}.mp3   (1000ファイル)
#   合計: 1100ファイル

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AUDIO_DIR="$PROJECT_ROOT/public/audio"
TEMP_DIR="$PROJECT_ROOT/.temp-audio"
MAX_HONBA=10

# ディレクトリ作成
mkdir -p "$AUDIO_DIR"
mkdir -p "$TEMP_DIR"

echo "🎵 麻雀点数音声ファイル生成開始"
echo "出力先: $AUDIO_DIR"
echo ""

# 千の位をひらがなに変換
sen_reading() {
  local thousands=$(($1 / 1000))
  case $thousands in
    1) echo "せん" ;;
    2) echo "にせん" ;;
    3) echo "さんぜん" ;;
    4) echo "よんせん" ;;
    5) echo "ごせん" ;;
    6) echo "ろくせん" ;;
    7) echo "ななせん" ;;
    8) echo "はっせん" ;;
    9) echo "きゅうせん" ;;
    *) echo "" ;;
  esac
}

# 百の位の補正（sayが数字「200」「400」を不自然に読むため、全てひらがなに）
# 万未満のみ対応。万以上はformat_numberで処理する
fix_hundreds() {
  local num=$1
  if [ "$num" -ge 10000 ]; then
    echo "$num"
    return
  fi
  local hundreds=$((num % 1000))
  if [ "$hundreds" -eq 200 ] || [ "$hundreds" -eq 400 ]; then
    local sen=$(sen_reading "$num")
    local hyaku=""
    if [ "$hundreds" -eq 200 ]; then
      hyaku="二百"
    else
      hyaku="4百"
    fi
    echo "${sen}${hyaku}"
  else
    echo "$num"
  fi
}

# 数字をTTS用テキストに変換
# - 万未満: 数字のまま（sayの自然な読み）+ 400のみひらがな補正
# - 万以上: ひらがな万 + [[slnc 50]] + 残りを数字
#   （万と千を自然につなげつつ 11600等の「いっせん」→「せん」自動修正）
format_number() {
  local num=$1

  if [ "$num" -ge 10000 ]; then
    local man=$((num / 10000))
    local rest=$((num % 10000))
    local man_reading=""
    case $man in
      1) man_reading="いちまん" ;;
      2) man_reading="にまん" ;;
      3) man_reading="さんまん" ;;
      4) man_reading="よんまん" ;;
      5) man_reading="ごまん" ;;
      6) man_reading="ろくまん" ;;
      7) man_reading="ななまん" ;;
      8) man_reading="はちまん" ;;
      9) man_reading="きゅうまん" ;;
    esac
    if [ "$rest" -gt 0 ]; then
      local formatted_rest=$(fix_hundreds "$rest")
      echo "${man_reading}[[slnc 50]]${formatted_rest}"
    else
      echo "${man_reading}"
    fi
  else
    fix_hundreds "$num"
  fi
}

# 数値を全てひらがなに変換（クロスフェード用）
number_to_hiragana() {
  local num=$1
  local result=""
  local remaining=$num

  if [ "$remaining" -ge 10000 ]; then
    local man=$((remaining / 10000))
    case $man in
      1) result="${result}いちまん" ;; 2) result="${result}にまん" ;;
      3) result="${result}さんまん" ;; 4) result="${result}よんまん" ;;
      5) result="${result}ごまん" ;; 6) result="${result}ろくまん" ;;
      7) result="${result}ななまん" ;; 8) result="${result}はちまん" ;;
      9) result="${result}きゅうまん" ;;
    esac
    remaining=$((remaining % 10000))
  fi

  if [ "$remaining" -ge 1000 ]; then
    local sen=$((remaining / 1000))
    case $sen in
      1) result="${result}せん" ;; 2) result="${result}にせん" ;;
      3) result="${result}さんぜん" ;; 4) result="${result}よんせん" ;;
      5) result="${result}ごせん" ;; 6) result="${result}ろくせん" ;;
      7) result="${result}ななせん" ;; 8) result="${result}はっせん" ;;
      9) result="${result}きゅうせん" ;;
    esac
    remaining=$((remaining % 1000))
  fi

  if [ "$remaining" -ge 100 ]; then
    local hyaku=$((remaining / 100))
    case $hyaku in
      1) result="${result}ひゃく" ;; 2) result="${result}にひゃく" ;;
      3) result="${result}さんびゃく" ;; 4) result="${result}よんひゃく" ;;
      5) result="${result}ごひゃく" ;; 6) result="${result}ろっぴゃく" ;;
      7) result="${result}ななひゃく" ;; 8) result="${result}はっぴゃく" ;;
      9) result="${result}きゅうひゃく" ;;
    esac
  fi

  echo "$result"
}

# 音声ファイル生成関数
generate_audio() {
  local text="$1"
  local output_file="$2"
  local temp_aiff="$TEMP_DIR/$(basename "$output_file" .mp3).aiff"

  say -v "Otoya (Enhanced)" -o "$temp_aiff" "$text"
  ffmpeg -y -i "$temp_aiff" -filter:a "volume=2.0" -acodec libmp3lame -ab 64k -ac 1 -ar 22050 "$output_file" 2>/dev/null
  rm -f "$temp_aiff"
}

# 前半・後半を分割生成しクロスフェード50msで結合
generate_audio_crossfade() {
  local front_text="$1"
  local back_text="$2"
  local output_file="$3"
  local base="$TEMP_DIR/$(basename "$output_file" .mp3)"

  say -v "Otoya (Enhanced)" -o "${base}_front.aiff" "$front_text"
  say -v "Otoya (Enhanced)" -o "${base}_back.aiff" "$back_text"
  ffmpeg -y -i "${base}_front.aiff" -af "volume=2.0" -f wav "${base}_front.wav" 2>/dev/null
  ffmpeg -y -i "${base}_back.aiff" -af "volume=2.0" -f wav "${base}_back.wav" 2>/dev/null
  ffmpeg -y -i "${base}_front.wav" -i "${base}_back.wav" \
    -filter_complex "[0:a][1:a]acrossfade=d=0.05:c1=tri:c2=tri[out]" -map "[out]" \
    -acodec libmp3lame -ab 64k -ac 1 -ar 22050 "$output_file" 2>/dev/null
  rm -f "${base}_front.aiff" "${base}_back.aiff" "${base}_front.wav" "${base}_back.wav"
}

# 千X百のパターンでイントネーション問題が起きるか判定
# 1000以上かつ百の位が400の数値が先頭に来る場合に該当
needs_crossfade() {
  local num=$1
  [ "$num" -ge 1000 ] && [ $((num % 1000)) -eq 400 ]
}

# 点数表データ（ID、親ロン、子ロン、親ツモAll、子ツモParent、子ツモChild）
declare -a SCORES=(
  "1-30 1500 1000 500 500 300"
  "1-40 2000 1300 700 700 400"
  "1-50 2400 1600 800 800 400"
  "1-60 2900 2000 1000 1000 500"
  "1-70 3400 2300 1200 1200 600"
  "1-90 4400 2900 1500 1500 800"
  "1-100 4800 3200 1600 1600 800"
  "2-25 2400 1600 800 800 400"
  "2-30 2900 2000 1000 1000 500"
  "2-40 3900 2600 1300 1300 700"
  "2-50 4800 3200 1600 1600 800"
  "2-60 5800 3900 2000 2000 1000"
  "2-70 6800 4500 2300 2300 1200"
  "2-90 8700 5800 2900 2900 1500"
  "2-100 9600 6400 3200 3200 1600"
  "2-110 10600 7100 3600 3600 1800"
  "3-25 4800 3200 1600 1600 800"
  "3-30 5800 3900 2000 2000 1000"
  "3-40 7700 5200 2600 2600 1300"
  "3-50 9600 6400 3200 3200 1600"
  "3-60 11600 7700 3900 3900 2000"
  "4-25 9600 6400 3200 3200 1600"
  "4-30 11600 7700 3900 3900 2000"
  "4-40 12000 8000 4000 4000 2000"
  "mangan 12000 8000 4000 4000 2000"
  "haneman 18000 12000 6000 6000 3000"
  "baiman 24000 16000 8000 8000 4000"
  "sanbaiman 36000 24000 12000 12000 6000"
  "yakuman 48000 32000 16000 16000 8000"
  "double-yakuman 96000 64000 32000 32000 16000"
)

num_scores=${#SCORES[@]}
total=$(( num_scores * 4 * (1 + MAX_HONBA) ))
count=0

for score_data in "${SCORES[@]}"; do
  read -r id parent_ron child_ron parent_tsumo_all child_tsumo_parent child_tsumo_child <<< "$score_data"

  # 全数値をひらがなに変換
  f_parent_ron=$(format_number "$parent_ron")
  f_child_ron=$(format_number "$child_ron")
  f_parent_tsumo_all=$(format_number "$parent_tsumo_all")
  f_child_tsumo_parent=$(format_number "$child_tsumo_parent")
  f_child_tsumo_child=$(format_number "$child_tsumo_child")

  # ===== 0本場 =====
  count=$((count + 1))
  echo "[$count/$total] parent_ron_${id}.mp3 - $f_parent_ron"
  generate_audio "$f_parent_ron" "$AUDIO_DIR/parent_ron_${id}.mp3"

  count=$((count + 1))
  echo "[$count/$total] child_ron_${id}.mp3 - $f_child_ron"
  generate_audio "$f_child_ron" "$AUDIO_DIR/child_ron_${id}.mp3"

  count=$((count + 1))
  text="${f_parent_tsumo_all}オール"
  echo "[$count/$total] parent_tsumo_${id}.mp3 - $text"
  generate_audio "$text" "$AUDIO_DIR/parent_tsumo_${id}.mp3"

  count=$((count + 1))
  text="${f_child_tsumo_child}、${f_child_tsumo_parent}"
  echo "[$count/$total] child_tsumo_${id}.mp3 - $text"
  generate_audio "$text" "$AUDIO_DIR/child_tsumo_${id}.mp3"

  # ===== 1〜10本場 =====
  for h in $(seq 1 $MAX_HONBA); do
    ron_bonus=$((h * 300))
    tsumo_bonus=$((h * 100))

    adj_parent_ron=$((parent_ron + ron_bonus))
    adj_child_ron=$((child_ron + ron_bonus))
    adj_parent_tsumo_all=$((parent_tsumo_all + tsumo_bonus))
    adj_child_tsumo_parent=$((child_tsumo_parent + tsumo_bonus))
    adj_child_tsumo_child=$((child_tsumo_child + tsumo_bonus))

    f_adj_parent_ron=$(format_number "$adj_parent_ron")
    f_adj_child_ron=$(format_number "$adj_child_ron")
    f_adj_parent_tsumo_all=$(format_number "$adj_parent_tsumo_all")
    f_adj_child_tsumo_parent=$(format_number "$adj_child_tsumo_parent")
    f_adj_child_tsumo_child=$(format_number "$adj_child_tsumo_child")

    # 本場用: 200/400のみ補正した値
    h_pr=$(fix_hundreds "$parent_ron"); h_cr=$(fix_hundreds "$child_ron")
    h_pta=$(fix_hundreds "$parent_tsumo_all"); h_ctp=$(fix_hundreds "$child_tsumo_parent"); h_ctc=$(fix_hundreds "$child_tsumo_child")
    h_apr=$(fix_hundreds "$adj_parent_ron"); h_acr=$(fix_hundreds "$adj_child_ron")
    h_apta=$(fix_hundreds "$adj_parent_tsumo_all"); h_actp=$(fix_hundreds "$adj_child_tsumo_parent"); h_actc=$(fix_hundreds "$adj_child_tsumo_child")

    # 親ロン: "baseは、adjusted"
    count=$((count + 1))
    text="${h_pr}は、${h_apr}"
    echo "[$count/$total] parent_ron_${id}_h${h}.mp3 - $text"
    generate_audio "$text" "$AUDIO_DIR/parent_ron_${id}_h${h}.mp3"

    # 子ロン: "baseは、adjusted"
    count=$((count + 1))
    text="${h_cr}は、${h_acr}"
    echo "[$count/$total] child_ron_${id}_h${h}.mp3 - $text"
    generate_audio "$text" "$AUDIO_DIR/child_ron_${id}_h${h}.mp3"

    # 親ツモ: "baseは、adjustedオール"
    count=$((count + 1))
    text="${h_pta}は、${h_apta}オール"
    echo "[$count/$total] parent_tsumo_${id}_h${h}.mp3 - $text"
    generate_audio "$text" "$AUDIO_DIR/parent_tsumo_${id}_h${h}.mp3"

    # 子ツモ: "childBase、parentBaseは、childAdj、parentAdj"
    count=$((count + 1))
    if needs_crossfade "$adj_child_tsumo_child"; then
      front="${h_ctc}、${h_ctp}は"
      hira_actc=$(number_to_hiragana "$adj_child_tsumo_child")
      back="${hira_actc}、${h_actp}"
      echo "[$count/$total] child_tsumo_${id}_h${h}.mp3 - [XF] ${front} | ${back}"
      generate_audio_crossfade "$front" "$back" "$AUDIO_DIR/child_tsumo_${id}_h${h}.mp3"
    else
      text="${h_ctc}、${h_ctp}は、${h_actc}、${h_actp}"
      echo "[$count/$total] child_tsumo_${id}_h${h}.mp3 - $text"
      generate_audio "$text" "$AUDIO_DIR/child_tsumo_${id}_h${h}.mp3"
    fi
  done
done

# 一時ディレクトリ削除
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 音声ファイル生成完了！"
echo "生成ファイル数: $count"
echo "合計サイズ: $(du -sh "$AUDIO_DIR" | cut -f1)"
