 \version "2.10.10"
     global = {
        \key bes \major
        \time 4/4
        \set Staff.midiInstrument = "alto sax"
		\partial 4*3
     }
     
     
     tenorMusic = \relative c' {
		d4 ees ees
		| ees2 d~
		| d2 d4 r
		| d g\glissando f ees8 d 
		| ees2 f2\glissando 
		| d1 \bar "||"
     }
     tenorWords =\lyricmode {
     	Come share this time with me, this la -- zy af -- ter -- noon with me.
     }
     leadMusic = \relative c' {
		bes4 c bes
		| aes2 bes
		| r2 c~
		| c1~
		| c1~
		| c1 \bar "||"
     }
     
     leadWords =\lyricmode {
     	Come share this time with me.
     }
     bariMusic = \relative c {
    	f4 aes g
		| f2 f
		| r2 ees~
		| ees1~
		| ees1\glissando
		| f1 \bar "||"
     }
     
     bassMusic = \relative c {
    	bes4 ees ees
		| des2 bes
		| r2 aes~
		| aes1~
		| aes1\glissando
		| bes1 \bar "||"
     }

     \header {
		dedication = "For Chelsea Hollow"
		title = "Lazy Afternoon"
		composer = "Jordan Eldredge"
	 }

     \score {
        \new ChoirStaff <<
        	\new Lyrics = "tenors" { s1 }
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
           \context Lyrics = tenors \lyricsto tenors \tenorWords
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
