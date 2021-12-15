\version "2.10.10"
notes = { c8 cis d dis e f fis g gis a ais b }
instrument = \set Staff.midiInstrument = "pad 8 (sweep)"
scale = \new Staff { \instrument \unfoldRepeats { \repeat volta 50 { \notes } } }



\score {
	\relative c,,,,, {
		<<
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
			\scale
		>>
	}
	\midi {
		\context {
			\Score tempoWholesPerMinute = #(ly:make-moment 75 4)	
		}
	}
}
