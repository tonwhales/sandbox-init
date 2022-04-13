set -e

#
# Elector Code
#

ton-compiler \
    --output ./elector-code.fif \
    --input ./elector-code.fc
ton-compiler \
    --fift \
    --output ./elector-code.cell \
    --input ./elector-code.fif
openssl base64 -A \
    -in ./elector-code.cell  \
    -out ./elector-code.cell.base64

#
# Config Code
#

ton-compiler \
    --output ./config-code.fif \
    --input ./config-code.fc
ton-compiler \
    --fift \
    --output ./config-code.cell \
    --input ./config-code.fif
openssl base64 -A \
    -in ./config-code.cell  \
    -out ./config-code.cell.base64