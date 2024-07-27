#!/bin/bash
# It takes approx. 1.5 mins for all iter2 to run this script

# Reminder 90sec limits on test
# While logged into a CSE machine
#$ time npm run test

RED='\x1b[31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE=$(tput setaf 4)
NC='\x1b[0m'
RED_BG='\x1b[41m'

function start {
  echo "installing packages..."
  npm i > /dev/null 2>&1

  echo -n "starting server... ... "
  npm run ts-node-coverage > server.log 2>&1 &
  server_pid=$!
  sleep 2

  # if echo "$SERVER_LOG" | grep -qE 'Error:'; then
  if ! ps -p $server_pid > /dev/null; then
    echo -e "${RED} ✖ Server failed to start${NC}"
    echo "$SERVER_LOG" | grep -E 'Error:' | sed -E "s/^/  /;s/(Error:)/${RED}\1${NC}/"
    # if geting error of address already in use, you can run below in the terminal:
    # `lsof -i :3200`, where 3200 is th port number
    # `kill -9 <PID>` note to replace <PID> which from previous command
    rm server.log
    return 1
  fi

  echo -e " ⚡️ ${GREEN}Server start successfully${NC}"
}

function test {
  echo -e -n "${YELLOW}Running tests${NC}"

  TEST_OUTPUT=$(npm t 2>&1)
  FAILED_SUITES=$(echo "$TEST_OUTPUT" | grep -o 'failed' | wc -l)

  if [ "$FAILED_SUITES" -eq 0 ]; then
    echo -e " ${GREEN}✔ test pass${NC}"
  else
    echo -e " ${RED}✖ test(s) fail${NC}"
    echo "$TEST_OUTPUT" | grep -E '^FAIL' | sed "s/^FAIL/${RED_BG}&${NC}/g"
    echo "$TEST_OUTPUT" | grep -E '^Test Suites:|^Tests:' | sed "s/failed/${RED}&${NC}/g"
  fi
}

function tsc {
  echo -e -n "${YELLOW}Running tsc${NC}"
  TSC_LOG=$(npm run tsc 2>&1 | grep -E 'error|warning|warning:|error:')
  if [[ -z $TSC_LOG ]]; then
    echo -e "${GREEN}   ✔ tsc pass${NC}"
  else
    echo -e "${RED}   ✖ lint fail${NC}"
    echo -e "$TSC_LOG${NC}" | grep -E 'error|warning|warning:|error:' | sed -E \
    "s/^/  /; \
     s/^([^(]+)\(/${BLUE}\1${NC}(/; \
     s/(error|warning)/${RED}\1${NC}/g"
  fi
}

function lint {
  echo -e -n "${YELLOW}Running lint${NC}"
  # npm run lint | grep -E 'WARNING|error|problem|Unexpected any'
  LINT_LOG=$(npm run lint -- --color 2>&1 | grep -vE '^> ' | sed '/^$/d')
  if [[ -z $LINT_LOG ]]; then
      echo -e "${GREEN}  ✔ lint pass${NC}\n"
  else
      echo -n "  "
      echo -n "$LINT_LOG" | sed '/^$/d' | grep -E '✖ .*'
      echo "$LINT_LOG"
  fi
}

function end {
  kill $server_pid
  echo "Shutting down server gracefully."
  wait $server_pid
  rm server.log
  rm hs256_secret_key.txt
}

start && test && tsc && lint && end