#!/bin/bash

# 麻雀点数音声ファイル生成スクリプト
# macOS sayコマンド + ffmpegを使用
#
# 使用方法: ./scripts/generate-audio.sh
# 必要条件: macOS, ffmpeg (brew install ffmpeg)

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
AUDIO_DIR="$PROJECT_ROOT/public/audio"
TEMP_DIR="$PROJECT_ROOT/.temp-audio"

# ディレクトリ作成
mkdir -p "$AUDIO_DIR"
mkdir -p "$TEMP_DIR"

echo "🎵 麻雀点数音声ファイル生成開始"
echo "出力先: $AUDIO_DIR"
echo ""

# 数字を日本語読みに変換する関数
number_to_japanese() {
  local num=$1

  case $num in
    300) echo "サンビャク" ;;
    400) echo "ヨンヒャク" ;;
    500) echo "ゴヒャク" ;;
    600) echo "ロッピャク" ;;
    700) echo "ナナヒャク" ;;
    800) echo "ハッピャク" ;;
    1000) echo "セン" ;;
    3000) echo "サンゼン" ;;
    1200) echo "センニヒャク" ;;
    1300) echo "センサンビャク" ;;
    1500) echo "センゴヒャク" ;;
    1600) echo "センロッピャク" ;;
    2000) echo "ニセン" ;;
    2300) echo "ニセンサンビャク" ;;
    2400) echo "ニセンヨンヒャク" ;;
    2600) echo "ニセンロッピャク" ;;
    2900) echo "ニセンキュウヒャク" ;;
    3200) echo "サンゼンニヒャク" ;;
    3400) echo "サンゼンヨンヒャク" ;;
    3900) echo "サンゼンキュウヒャク" ;;
    4000) echo "ヨンセン" ;;
    4500) echo "ヨンセンゴヒャク" ;;
    4800) echo "ヨンセンハッピャク" ;;
    5200) echo "ゴセンニヒャク" ;;
    5800) echo "ゴセンハッピャク" ;;
    6000) echo "ロクセン" ;;
    6400) echo "ロクセンヨンヒャク" ;;
    6800) echo "ロクセンハッピャク" ;;
    7700) echo "ナナセンナナヒャク" ;;
    8000) echo "ハッセン" ;;
    9600) echo "キュウセンロッピャク" ;;
    12000) echo "イチマンニセン" ;;
    16000) echo "イチマンロクセン" ;;
    18000) echo "イチマンハッセン" ;;
    24000) echo "ニマンヨンセン" ;;
    32000) echo "サンマンニセン" ;;
    36000) echo "サンマンロクセン" ;;
    48000) echo "ヨンマンハッセン" ;;
    64000) echo "ロクマンヨンセン" ;;
    96000) echo "キュウマンロクセン" ;;
    *) echo "$num" ;;
  esac
}

# 音声ファイル生成関数
generate_audio() {
  local text="$1"
  local output_file="$2"
  local temp_aiff="$TEMP_DIR/$(basename "$output_file" .mp3).aiff"

  # sayコマンドでAIFF生成 (Otoya Enhanced音声)
  say -v "Otoya (Enhanced)" -o "$temp_aiff" "$text"

  # ffmpegでMP3に変換 (64kbps、モノラル、音量2倍)
  ffmpeg -y -i "$temp_aiff" -filter:a "volume=2.0" -acodec libmp3lame -ab 64k -ac 1 -ar 22050 "$output_file" 2>/dev/null

  # 一時ファイル削除
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
  "3-60 12000 8000 4000 4000 2000"
  "4-25 9600 6400 3200 3200 1600"
  "4-30 12000 8000 4000 4000 2000"
  "4-40 12000 8000 4000 4000 2000"
  "mangan 12000 8000 4000 4000 2000"
  "haneman 18000 12000 6000 6000 3000"
  "baiman 24000 16000 8000 8000 4000"
  "sanbaiman 36000 24000 12000 12000 6000"
  "yakuman 48000 32000 16000 16000 8000"
  "double-yakuman 96000 64000 32000 32000 16000"
)

count=0
total=$((${#SCORES[@]} * 4))

for score_data in "${SCORES[@]}"; do
  read -r id parent_ron child_ron parent_tsumo_all child_tsumo_parent child_tsumo_child <<< "$score_data"

  # 1. 親ロン（点数のみ）
  count=$((count + 1))
  text=$(number_to_japanese "$parent_ron")
  output="$AUDIO_DIR/parent_ron_${id}.mp3"
  echo "[$count/$total] parent_ron_${id}.mp3 - $text"
  generate_audio "$text" "$output"

  # 2. 子ロン（点数のみ）
  count=$((count + 1))
  text=$(number_to_japanese "$child_ron")
  output="$AUDIO_DIR/child_ron_${id}.mp3"
  echo "[$count/$total] child_ron_${id}.mp3 - $text"
  generate_audio "$text" "$output"

  # 3. 親ツモ（XXXオール）
  count=$((count + 1))
  text="$(number_to_japanese "$parent_tsumo_all")オール"
  output="$AUDIO_DIR/parent_tsumo_${id}.mp3"
  echo "[$count/$total] parent_tsumo_${id}.mp3 - $text"
  generate_audio "$text" "$output"

  # 4. 子ツモ（XXX、YYY）
  count=$((count + 1))
  child_part=$(number_to_japanese "$child_tsumo_child")
  parent_part=$(number_to_japanese "$child_tsumo_parent")
  text="${child_part}、${parent_part}"
  output="$AUDIO_DIR/child_tsumo_${id}.mp3"
  echo "[$count/$total] child_tsumo_${id}.mp3 - $text"
  generate_audio "$text" "$output"
done

# 一時ディレクトリ削除
rm -rf "$TEMP_DIR"

echo ""
echo "✅ 音声ファイル生成完了！"
echo "生成ファイル数: $count"
echo ""
ls -la "$AUDIO_DIR" | head -20
echo "..."
echo "合計サイズ: $(du -sh "$AUDIO_DIR" | cut -f1)"
