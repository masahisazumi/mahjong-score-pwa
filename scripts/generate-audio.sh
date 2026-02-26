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

# 数字をTTS用テキストに変換
# - 万・千はひらがな（イントネーション制御）
# - 百は数字のまま（sayの自然な発声に任せる）
# - 千の位1は「せん」（「いっせん」ではなく）
# - 万と千の間に [[slnc 150]] で間を確保
format_number() {
  local num=$1
  local result=""
  local remaining=$num

  # 万の位 (10000s) → ひらがな
  local man=$((remaining / 10000))
  if [ $man -gt 0 ]; then
    case $man in
      1) result="いちまん" ;;
      2) result="にまん" ;;
      3) result="さんまん" ;;
      4) result="よんまん" ;;
      5) result="ごまん" ;;
      6) result="ろくまん" ;;
      7) result="ななまん" ;;
      8) result="はちまん" ;;
      9) result="きゅうまん" ;;
    esac
    remaining=$((remaining % 10000))
    # 万の後に千が続く場合は間を入れる（食い気味防止）
    if [ $((remaining / 1000)) -gt 0 ]; then
      result="${result}[[slnc 150]]"
    fi
  fi

  # 千の位 (1000s) → ひらがな
  local sen=$((remaining / 1000))
  if [ $sen -gt 0 ]; then
    case $sen in
      1) result="${result}せん" ;;
      2) result="${result}にせん" ;;
      3) result="${result}さんぜん" ;;
      4) result="${result}よんせん" ;;
      5) result="${result}ごせん" ;;
      6) result="${result}ろくせん" ;;
      7) result="${result}ななせん" ;;
      8) result="${result}はっせん" ;;
      9) result="${result}きゅうせん" ;;
    esac
    remaining=$((remaining % 1000))
  fi

  # 百の位 (100s) → 数字のまま（sayの自然な読みに任せる）
  if [ $remaining -gt 0 ]; then
    result="${result}${remaining}"
  fi

  # 千以上がない場合（百のみ）は数字そのまま
  if [ -z "$result" ]; then
    echo "$num"
  else
    echo "$result"
  fi
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

# 点数表データ（ID、親ロン、子ロン、親ツモAll、子ツモParent、子ツモChild）
declare -a SCORES=(
  "1-30 1500 1000 500 500 300"
  "1-40 2000 1300 700 700 400"
  "1-50 2400 1600 800 800 400"
  "1-60 2900 2000 1000 1000 500"
  "1-70 3400 2300 1200 1200 600"
  "2-25 2400 1600 800 800 400"
  "2-30 2900 2000 1000 1000 500"
  "2-40 3900 2600 1300 1300 700"
  "2-50 4800 3200 1600 1600 800"
  "2-60 5800 3900 2000 2000 1000"
  "2-70 6800 4500 2300 2300 1200"
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
  text="${f_parent_tsumo_all}、オール"
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

    # 親ロン: "base は adjusted" （は の前に間を確保）
    count=$((count + 1))
    text="${f_parent_ron}[[slnc 100]]は、${f_adj_parent_ron}"
    echo "[$count/$total] parent_ron_${id}_h${h}.mp3 - $text"
    generate_audio "$text" "$AUDIO_DIR/parent_ron_${id}_h${h}.mp3"

    # 子ロン: "base は adjusted"
    count=$((count + 1))
    text="${f_child_ron}[[slnc 100]]は、${f_adj_child_ron}"
    echo "[$count/$total] child_ron_${id}_h${h}.mp3 - $text"
    generate_audio "$text" "$AUDIO_DIR/child_ron_${id}_h${h}.mp3"

    # 親ツモ: "base は adjusted オール"
    count=$((count + 1))
    text="${f_parent_tsumo_all}[[slnc 100]]は、${f_adj_parent_tsumo_all}、オール"
    echo "[$count/$total] parent_tsumo_${id}_h${h}.mp3 - $text"
    generate_audio "$text" "$AUDIO_DIR/parent_tsumo_${id}_h${h}.mp3"

    # 子ツモ: "childBase、parentBase は childAdj、parentAdj"
    count=$((count + 1))
    text="${f_child_tsumo_child}、${f_child_tsumo_parent}[[slnc 100]]は、${f_adj_child_tsumo_child}、${f_adj_child_tsumo_parent}"
    echo "[$count/$total] child_tsumo_${id}_h${h}.mp3 - $text"
    generate_audio "$text" "$AUDIO_DIR/child_tsumo_${id}_h${h}.mp3"
  done
done

# 一時ディレクトリ削除
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 音声ファイル生成完了！"
echo "生成ファイル数: $count"
echo "合計サイズ: $(du -sh "$AUDIO_DIR" | cut -f1)"
