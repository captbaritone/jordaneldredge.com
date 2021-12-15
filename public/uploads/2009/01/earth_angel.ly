 \version "2.10.10"
     global = {
        \key ees \major
        \time 4/4
        \partial 4
     }
     
     
     tenorMusic = \relative c' {
        r4
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c4 c8 c8 d8( c8)
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c4 c8 c8 d8( c8)
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c8 c8 d4. c8
        | c8( bes8~ bes2~ bes8 c8) | r8 f8 f8 f8 g4( f4)
        
        | r8 bes,8 bes4 c8 c8 c4 | r8 c8 c4 c8 c8 d8( c8)
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c4 c8 c8 d8( c8)
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c8 c8 d4. c8
        | c8( bes4. c2 | bes2) r2
        
        | c4. c8 d( c4.) | r8 bes4 a8 bes4. bes8 
        | aes8 aes aes aes aes4 ees'8 d | d( bes4.~ bes4) r4 
        | ees4 ees8 ees f( ees4.) | r8 ees4 d8 c4 r4
        | R1 | R1
        
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c4 c8 c8 d8( c8)
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c4 c8 c8 d8( c8)
        | r8 bes8 bes4 c8 c8 c4 | r8 c8 c8 c8 d4. c8
        | c8( bes4. c2 | bes2.) r4
        
     }
     tenorWords = \lyricmode {
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, a fool in love with you. In love with you!
        
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, a fool in love with you.
        
        Fell for you and I knew the
		vi -- sion of your love's love -- li -- nes.
		Hope and I prey that some day 
        
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, a fool in love with you. In love with you!
     }
     bariMusic = \relative c' {
        r4
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes4 aes8 aes8 bes8( aes8)
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes4 aes8 aes8 bes8( aes8)
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes8 aes8 bes4. aes8
        | aes8( g8~ g2.)| r8 aes8 aes8 aes8 bes4( aes4)
        
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes4 aes8 aes8 bes8( aes8)
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes4 aes8 aes8 bes8( aes8)
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes8 aes8 bes4. aes8
        | aes8( g4. aes2 | g2) r2
        
        | R1 | R1
        | R1 | R1
        | R1 | R1
        | R1 | R1
        
		| r8 g8 g4 g8 g8 g4 | r8 aes8 aes4 aes8 aes8 bes8( aes8)
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes4 aes8 aes8 bes8( aes8)
        | r8 g8 g4 g8 g8 g4 | r8 aes8 aes8 aes8 bes4. aes8
        | aes8( g4. aes2 | g2.) r4
     }
     bariWords = \lyricmode {
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, a fool in love with you. In love with you!
        
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, a fool in love with you.
        
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, shoo doop shoo be wah.
        Shoo doop shoo be doo, a fool in love with you.
     }
     
     leadMusic = \relative c' {
        g4 
        | ees8 ees4 bes'8 g8 g4. | r8 aes8 aes g g( f4.)
        | r8 ees f g g( ees4.) | aes8 aes aes g g( f4.)
        | r8 ees ees f g( ees4.) | r8 aes aes g f4. g8
        | ees1~ | ees2 r4. g8 
        
        | ees8 ees4 bes'8 g8 g4. | r8 aes8 \times 2/3 {aes aes g} g( f4.)
        | r8 ees f g g ees4 ees8 | aes4. g8 g( f4.)
        | r8 ees ees f g( ees4.) | r8 aes aes g f4. g8
        | ees1~ | ees2 r4 ees4 
        
        | aes4. aes8 bes( aes4.) | r8 g4 fis8 g4. ees8 
        | f8 f f f f4 c'8 bes | bes( g4.~ g4) r8 ees 
        | c'4 c8 c d( c4.) | r8 c4 bes8 bes( g)  \times 2/3 {c,8 c8 ees}
        | g8 g4. g8 f ees g | f2 r4 g4
        
        | ees8 ees4 bes'8 g8 g4. | r8 aes4 g8 g( f4.)
        | r8 ees f g g( ees4.) | aes8 aes aes g g( f4.)
        | r8 ees ees f g( ees4.) | r8 aes aes g f4. g8
        | ees1~ | ees2. r4
        
        
     }
     leadWords =\lyricmode {
		Earth | 
		An -- gel, Earth An -- gel,  will you be mine, 
		my dar -- ling, dear,  love you all the time.
		I'm just a fool,  a fool in love with 
		you. Earth
		
		An -- gel, Earth An -- gel,  the one I a -- dore, 
		love you for -- ev --er and ev -- er more.
		I'm just a fool,  a fool in love with 
		you. I
		
		fell for you and I knew the
		vi -- sion of your love's love -- li -- nes.
		I hope and I prey that some day I'll be the 
		vi -- sion of your hap -- pi -- ness. Earth
		
		An -- gel, Earth An -- gel,  please be mine, 
		my dar -- ling, dear,  love you all the time.
		I'm just a fool,  a fool in love with 
		you.
     }
     bassMusic = \relative c {
        \times 2/3 {bes 8 c8 d}
        | ees4 ees8 d8 c4 c8 c8 | f4 f8 f8 bes,8 bes8 \times 2/3 {bes8 c8 d}
        | ees4 ees8 d8 c4 c8 c8 | f4 f8 f8 bes,8 bes8 \times 2/3 {bes8 c8 d}
        | ees4 ees8 d8 c4 c8 c8 | f8 f8 f8 f8 bes,4. bes8
        | ees4 ees8 d8 c4 c8 c8 | f8 f8 f8 f8 bes,4 \times 2/3 {bes8 c8 d}
        
        | ees4 ees8 d8 c4 c8 c8 | f4 f8 f8 bes,8 bes8 \times 2/3 {bes8 c8 d}
        | ees4 ees8 d8 c4 c8 c8 | f4 f8 f8 bes,8 bes8 \times 2/3 {bes8 c8 d}
        | ees4 ees8 d8 c4 c8 c8 | f8 f8 f8 f8 bes,4. bes8
        | ees4 ees8 ees aes,4 aes8 aes | ees'2 \times 2/3 {ees4 f g}
        
        | aes4. aes8 aes4. aes8 | ees4. d8 ees4. ees8 
        | f4. f8 bes,4. bes8 | ees4. d8 ees4. ees8 
        | aes,4. aes8 a4. a8 | bes4. bes8 c4. c8
        | f,4. f8 f4. f8 | bes2 r4 \times 2/3 {bes 8 c8 d}
        
        | ees4 ees8 d8 c4 c8 c8 | f4 f8 f8 bes,8 bes8 \times 2/3 {bes8 c8 d}
        | ees4 ees8 d8 c4 c8 c8 | f4 f8 f8 bes,8 bes8 \times 2/3 {bes8 c8 d}
        | ees4 ees8 d8 c4 c8 c8 | f8 f8 f8 f8 bes,4. bes8
        | ees1~ | ees2. r4 \bar "|."
     }
     bassWords = \lyricmode {
        Doo buh dee |
        dum bop bah dum bop bah | dum bop bah doo doo doo buh dee
        dum bop bah dum bop bah | dum bop bah doo doo doo buh dee
        dum bop bah dum bop bah | dum a fool in love with
        you doo doo doo doo doo  doo in love with you! doo buh dee 
        
        dum bop bah dum bop bah | dum bop bah doo doo doo buh dee
        dum bop bah dum bop bah | dum bop bah doo doo doo buh dee
        dum bop bah dum bop bah | dum a fool in love with
        you doo buh doo doo buh doo dum dum dum
        
        doo buh doo buh | doo buh doo buh |
        doo buh doo buh | doo buh doo buh |
        doo buh doo buh | doo buh doo buh |
        doo buh doo buh | doo Doo buh dee 
        
        dum bop bah dum bop bah | dum bop bah doo doo doo buh dee
        dum bop bah dum bop bah | dum bop bah doo doo doo buh dee
        dum bop bah dum bop bah | dum a fool in love with
        you.
       
        
        
        
     }
     \header {
		dedication = "For Chelsea"
		title = "Earth Angel"
		composer =  "Words and Music: Jesse Belvin"
		arranger = "Arrangement: Jordan Eldredge"
	  }

     \score {
        \new ChoirStaff <<
           \new Staff = tenorStaff <<
           	\set Staff.instrumentName = \markup { \hcenter-in #10 "Tenor" }
            \clef "G_8"
              \new Voice =
                "tenors" { \global \tenorMusic }
           >>
           \new Lyrics = "tenors" { s1 }
           
           
           \new Staff = bariStaff <<
           \set Staff.instrumentName = \markup { \hcenter-in #10 "Baritone" }
            \clef "G_8"
              \new Voice =
                "baris" { \global \bariMusic }
           >>
           \new Lyrics = "baris" { s1 }
           
           
           \new Staff = leadStaff <<
           	\set Staff.instrumentName = \markup { \hcenter-in #10 "Lead" }

              \clef "G_8"
              \new Voice =
                "leads" { \global \leadMusic }
           >>
           \new Lyrics = leads { s1 }
           
           \new Lyrics = bassStaff { s1 }
             \new Staff = leadStaff <<
             \set Staff.instrumentName = \markup { \hcenter-in #10 "Bass" }

              \clef bass
              \new Voice =
                "basses" { \global \bassMusic }
           >>
           \new Lyrics = basses { s1 }
     
           \context Lyrics = tenors \lyricsto tenors \tenorWords
           \context Lyrics = baris \lyricsto baris \bariWords
           \context Lyrics = leads \lyricsto leads \leadWords
           \context Lyrics = basses \lyricsto basses \bassWords
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
