 \version "2.10.10"
     global = {
        \key aes \major
        \time 3/4
        \partial 4
     }
     
     
     tenorMusic = \relative c' {
		g8. g16 
		| aes4 aes c 
		| bes2 bes8. bes16
		| bes4 bes des 
		| c2 ees8. ees16
		| aes4 ees ees8. ees16
		| des4 des\fermata f8. f16
		| ees4 c des 
		| c2 
     }
     
     leadMusic = \relative c {
		ees8. ees16 
		| f4 ees aes
		| g2 ees8. ees16
		| f4 ees bes'
		| aes2 ees8. ees16
		| ees'4 c aes8. aes16
		| g4 f\fermata des'8. des16
		| c4 aes bes
		| aes2
     }
     
     leadWords =\lyricmode {
		Hap -- py birth -- day to you, hap -- py birth -- day to you, hap -- py birth -- day dear A -- man -- da. Hap -- py birth -- day to you!
     }
     bariMusic = \relative c {
       des8. des16
       | c4 c ees 
       | ees2 g8. g16
       | g4 g g
       | ees2 ees8. ees16
       | c'4 aes c8. c16
       | bes4 aes\fermata aes8. aes16
       | ees4 ees g 
       | ees2 \bar "|."
     }
     
     bassMusic = \relative c {
        bes8. bes16 
        | aes4 aes aes
        | ees'2 ees8. ees16
        | bes4 ees ees
        | aes,2 ees'8. ees16
        | aes,4 aes aes8. aes16
        | ees'4 des\fermata des8. des16
        | aes4 aes ees' 
        | aes,2
     }

     \header {
		dedication = "For Amanda Ortmayer"
		title = "Happy Birthday"
		arranger = "Arrangement: Jordan Eldredge"
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
           \context {
              % a little smaller so lyrics
              % can be closer to the staff
              \Staff
              \override VerticalAxisGroup #'minimum-Y-extent = #'(-3 . 3)
           }
        }
		\midi {
			\context {
				\Score
				tempoWholesPerMinute = #(ly:make-moment 80 4)
			}
		}

     }
