; SMH 자동강의 플레이어 v1.7

; GUI 생성
Gui, +AlwaysOnTop +Resize -MaximizeBox
Gui, Font, s10, Segoe UI
Gui, Color, White

; 타이틀 바와 버전 번호
Gui, Add, Text, x10 y10 w580 h30 Center cGray, SMH 자동강의 플레이어 v1.7

; 입력 창
Gui, Add, Text, x10 y50 w200 h20, 강의 내용을 여기에 붙여넣으세요:
Gui, Add, Edit, x10 y70 w380 h150 vLectureText -WantTab gUpdateStatus

; 글자 입력 간격
Gui, Add, Text, x10 y230 w200 h20, 글자 입력 간격 (ms):
Gui, Add, Edit, x210 y230 w50 h20 vCharIntervalEdit Number Limit4
Gui, Add, UpDown, vCharInterval Range1-9999, 10

; 간격 랜덤 생성
Gui, Add, Text, x270 y230 w200 h20, 간격 랜덤 생성 (ms):
Gui, Add, Edit, x470 y230 w50 h20 vRandomIntervalEdit Number Limit4
Gui, Add, UpDown, vRandomInterval Range0-9999, 50

; 버튼
Gui, Add, Button, x10 y260 w120 h30 gStart, 시작 (F1)
Gui, Add, Button, x140 y260 w120 h30 gPause, 일시정지 (F2)
Gui, Add, Button, x270 y260 w120 h30 gResume, 재시작 (F3)
Gui, Add, Button, x400 y260 w120 h30 gStop, 정지 (F4)
Gui, Add, Button, x530 y260 w120 h30 gExit, 프로그램 종료

; 상태 표시
Gui, Add, Text, x10 y300 w380 h20 vStatusText cBlue, 상태: 대기 중
Gui, Add, Text, x10 y320 w380 h20 vCharCountText, 글자 수:
Gui, Add, Text, x10 y340 w380 h20 vRemainingTimeText, 남은 시간:

; 도움말
Gui, Add, Text, x410 y50 w200 h20, 도움말:
Gui, Add, Text, x420 y70 w200 h20, F1 - 시작
Gui, Add, Text, x420 y90 w200 h20, F2 - 일시정지
Gui, Add, Text, x420 y110 w200 h20, F3 - 재시작
Gui, Add, Text, x420 y130 w200 h20, F4 - 정지
Gui, Add, Text, x420 y150 w200 h20, F5 - 간격 감소 (-10ms)
Gui, Add, Text, x420 y170 w200 h20, F6 - 간격 증가 (+10ms)

; GUI 표시
Gui, Show,, SMH 자동강의 플레이어 v1.7
return

; 전역 변수
global isRunning := false
global isPaused := false
global charInterval := 10
global totalChars := 0
global processedChars := 0
global remainingTime := 0

Start:
    if (!isRunning) {
        Gui, Submit, NoHide
        if (LectureText = "") {
            GuiControl,, StatusText, 상태: 글자를 입력해 주세요
            return
        }
        charInterval := CharIntervalEdit
        totalChars := StrLen(LectureText)
        remainingTime := Round((totalChars * charInterval) / 1000, 1)
        remainingTimeText := FormatTime(remainingTime)
        processedChars := 0
        isRunning := true
        isPaused := false
        GuiControl, Disable, LectureText
        GoSub, PlayPauseLoop
    }
return

Pause:
    if (isRunning && !isPaused) {
        isPaused := true
        remainingTimeText := FormatTime(remainingTime)
        GuiControl,, StatusText, 상태: 일시정지
        GuiControl,, CharCountText, 글자 수: %processedChars%/%totalChars%
        GuiControl,, RemainingTimeText, 남은 시간: %remainingTimeText%
    }
return

Resume:
    if (isRunning && isPaused) {
        isPaused := false
        GoSub, PlayPauseLoop
    }
return

PlayPauseLoop:
    Loop {
        if (!isRunning || isPaused) {
            break
        }


        ; 사용자가 입력한 간격과 랜덤 간격을 합산하여 Sleep에 사용할 간격 계산
        Random, randomInterval, 0, RandomIntervalEdit  ; 0부터 RandomIntervalEdit까지의 랜덤 값을 가져옴
        currentInterval := charInterval + randomInterval
        SendInput, % SubStr(LectureText, processedChars + 1, 1)
        Sleep, %currentInterval%
        ; SendInput, % SubStr(LectureText, processedChars + 1, 1)
        ; Sleep, %charInterval%
        processedChars++
        progress := Round((processedChars / totalChars) * 100, 2)
        remainingTime := Round(((totalChars - processedChars) * charInterval) / 1000, 1)
        remainingTimeText := FormatTime(remainingTime)
        GuiControl,, StatusText, 상태: 강의 중
        GuiControl,, CharCountText, 글자 수: %processedChars%/%totalChars%
        GuiControl,, RemainingTimeText, 남은 시간: %remainingTimeText%
        if (processedChars >= totalChars) {
            GuiControl, Enable, LectureText
            GuiControl,, StatusText, 상태: 완료
            isRunning := false
            break
        }
    }
return

Stop:
    isRunning := false
    isPaused := false
    processedChars := 0
    remainingTime := 0
    GuiControl, Enable, LectureText
    GuiControl,, StatusText, 상태: 대기 중
    GuiControl,, CharCountText, 글자 수:
    GuiControl,, RemainingTimeText, 남은 시간:
return

Exit:
    ExitApp
return

GuiClose:
    ExitApp
return

ButtonExit:
    GoSub, Exit
return

ButtonStart:
    GoSub, Start
return

ButtonPause:
    GoSub, Pause
return

ButtonResume:
    GoSub, Resume
return

ButtonStop:
    GoSub, Stop
return

UpdateStatus:
    Gui, Submit, NoHide
    totalChars := StrLen(LectureText)
    if (totalChars > 0) {
        estTime := Round((totalChars * CharIntervalEdit) / 1000, 1)
        estTimeText := FormatTime(estTime)
        GuiControl,, StatusText, 상태: 대기 중
        GuiControl,, CharCountText, 글자 수: %totalChars%
        GuiControl,, RemainingTimeText, 예상 시간: %estTimeText%
    } else {
        GuiControl,, StatusText, 상태: 글자를 입력해 주세요
        GuiControl,, CharCountText, 글자 수:
        GuiControl,, RemainingTimeText, 예상 시간:
    }
return

FormatTime(seconds) {
    hours := Floor(seconds / 3600)
    minutes := Floor(Mod(seconds, 3600) / 60)
    seconds := Mod(seconds, 60)
    return Format("{:02}시 {:02}분 {:04.1f}초", hours, minutes, seconds)
}

; 핫키 설정
F1::GoSub, Start
F2::GoSub, Pause
F3::GoSub, Resume
F4::GoSub, Stop
F5::
    Gui, Submit, NoHide
    charInterval := CharIntervalEdit + 0  ; 숫자형으로 변환
    charInterval := (charInterval > 10) ? (charInterval - 10) : charInterval
    GuiControl,, CharIntervalEdit, %charInterval%
return
F6::
    Gui, Submit, NoHide
    charInterval := CharIntervalEdit + 0  ; 숫자형으로 변환
    charInterval := charInterval + 10
    GuiControl,, CharIntervalEdit, %charInterval%
return
