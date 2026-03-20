# Command: game

Команда `game` запускает игру "Vibe-Break / Fishanoid Edition" — интерпретацию Arkanoid в терминале.

## Intro

Текст, отображаемый при запуске команды:

```
$ game

Launching: Vibe‑Break / Fishanoid Edition…

Break the blocks. Free the fish. Pretend it's productive.

Enter your name:
```

## Instructions

Инструкции по управлению игрой (отображаются после ввода имени игрока):

```
Controls:

← → or mouse to move

SPACE to launch

ESC to bail out
```

## Fish Art

ASCII‑рыба с глитчами:

```
                ,"(
               ////\                           _
              (//////--,,,,,_____            ,"
            _;"""----/////_______;,,        //
__________;"o,-------------......"""""`'-._/(
      ""'==._.__,;;;;"""           ____,.-.==
             "-.:______,...;---""/"   "    \(
                 '-._      `-._("  \\
                     '-._                    '._
```

## Glitched Fish Variants

Варианты с глитчами для анимации. Глитчи применяются программно в коде, заменяя случайные символы на глитч-символы из набора `!@#$%^&*()_+-=[]{}|;:,.<>?/~`` и `█▓▒░▄▀■□▪▫` во время анимации.
