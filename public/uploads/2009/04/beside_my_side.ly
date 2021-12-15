 \version "2.10.10"
     global = {
        \key c \major
        \time 4/4
        \set Staff.midiInstrument = "alto sax"

     }
     
     
     tenorMusic = \relative c' {
		| c4 d e2 
		| e4 f ges2
		| g!4 g aes4 bes4\fermata
		| c1 \bar "||"
     }
     
     leadMusic = \relative c' {
		| c4 d c2
		| c4 d ees2
		| e!4 e ees4 d4\fermata
		| e1 \bar "||"
     }
     
     leadWords =\lyricmode {
     	I need you, on -- ly you, you be -- side my side!
     }
     bariMusic = \relative c' {
       | c4 b c2
       | c4 c c2
       | c4 c c4 c4\fermata
       | g1 \bar "||"
     }
     
     bassMusic = \relative c' {
		| c4 b bes2
		| a4 a aes2
		| g4 g ges4 f4\fermata
		| g2\glissando c, \bar "||"
     }

     \header {
		dedication = "For Chelsea Hollow"
		title = "You Beside My Side"
		composer = "Jordan Eldredge"
	 }

     \score {
        \new ChoirStaff <<
           \new Staff = tenorStaff <<
           	\clef "G_8"
              \new Voice =
                "tenors" { \voiceOne <<  \global \tenorMusic >> }
                \new Voice =
                "leads" { \voiceTwo << \global \leadMusic >> }
           >>
           \new Lyrics = "leads" { s1 }
           
           \new Staff = tenorStaff <<
           	\clef bass
              \new Voice =
                "baris" { \voiceOne <<  \global \bariMusic >> }
                \new Voice =
                "basses" { \voiceTwo << \global \bassMusic >> }
           >>
     
           \context Lyrics = leads \lyricsto leads \leadWords
        >>
     
        \layout {

        }
		\midi {
			\context {
				\Score
				tempoWholesPerMinute = #(ly:make-moment 70 4)
			}
		}

     }
