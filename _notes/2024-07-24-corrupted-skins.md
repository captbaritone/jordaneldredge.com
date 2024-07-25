---
title: The bizarre secrets I found investigating corrupt Winamp skins
tags:
  - winamp
  - found
  - anecdote
summary: >-
  I started looking through corrupt Winamp skins and it lead me down some very
  strange rabbit holes
summary_image: >-
  /notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/e94461bd-1f9c-4ef4-bbda-23acc32ef0df/EsErCPFVoAACjOn.jpeg
---
In January of 2021 I was exploring the corpus of Skins I collected for the [Winamp Skin Museum](https://jordaneldredge.com/blog/winamp-skin-musuem/) and found some that seemed corrupted, so I decided to explore them. Winamp skins are actually just zip files with a different file extension, so I tried extracting their files to see what I could find.

This ended up leading me down a series of wild rabbit holes where I found:

- Encrypted files which I was able to crack to discover their secrets
- A gift a dad in Thailand had made for his two and a half year old son, but didn’t want published online
- Somebody’s email password
- A secret biography of Chet Baker
- Cryptic backwards audio files
- A file called `worm.exe` which held quite the surprise
- A host of extremely random images and files
- 56 previously unknown Winamp skins hidden inside other Winamp skins!

This all aligned perfectly with my love of [Winamp](https://jordaneldredge.com/tag/winamp/), my love of [found items](https://jordaneldredge.com/tag/found/) and was enabled by storing all the data I have about these skins [in an sqlite database](https://twitter.com/captbaritone/status/1535471373191028737) (as [discussed on Hacker News](https://news.ycombinator.com/item?id=31703874)).

Here’s the story:

---

The first corrupted file I looked at contained just a PDF advertising a rentable bowling pin mascot costume:

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/e94461bd-1f9c-4ef4-bbda-23acc32ef0df/EsErCPFVoAACjOn.jpeg)

---

Another was called `bobs_car.wsz` and, as advertised, contained just this picture, which I have to assume is the titular “Bob’s car”.

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/02d049fc-ee84-42b7-95f1-52c4c434db63/bobs_car.jpg)

---

But then things got interesting. I found one that was an encrypted zip archive.

[resubmitted.2003\_rsx.wsz](https://capt.dev/file/TCIZp9O6FQBS51QrxWj1d/resubmitted.2003_acura_rsx.wsz)

I took the opportunity to learn about tools for brute forcing passwords in zip files. Soon enough, I cracked it, and found its contents:

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/7371ccc8-08f3-4202-b955-39ba04f31394/Screen_Shot_2021-01-18_at_10.46.36_PM.png)

The password was "honda”. No idea why it might have been encrypted.

---

Another one had been created by a dad in Thailand who made an Adobe Illustrator mock up illustration of a Winamp skin he had designed as a gift to his two and a half year old son. But he didn't know how to make it a skin, so he sent it to [winamp.com](http://winamp.com/) (along with a text file letter) asking that it be made into a skin that he could use. The letter was very touching but he asked them not to share the skin, so I have not included it here.

---

I found another encrypted zip file. This time the password was not in my wordlist. After a bit of fiddling with the cracking tool’s config file, I was able to brute force it as well. The result was a valid Winamp skin!

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/4d300a93-0973-42bf-8eff-43d2b4b33d94/Screen_Shot_2021-01-19_at_4.12.13_PM.png)

Password was "nayane”.

I went ahead and uploaded the decrypted version [here](/a3ea435df7ab4f7fa106ed23644b0358).

---

This got me interested in other “sensitive” things that might be included in skins, so I started searching for things like “password” inside the files _inside_ all the Winamp skins.

I found one with a file called `E-mail passwords.txt` which contained… their email address and email password. Not great operational security.

---

[Another skin](https://skins.webamp.org/skin/bf47d3cee462143bb4549fee59f567b2/Marshall_Matters_Skin_2.wsz/) contained a text file with hundreds of blank lines and then, at the very bottom, the text:

```text






YOU HAVE FOUND THE SUPRISE!!!
USE THIS PASSWORD:KEWL16
```

Inside the skin was a file `Suprise!.zip` which was itself encrypted, but the password didn’t work! Eventually I figured out that the password needed to be lower case. Inside were a bunch of `.avs` files:

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/5b5f915c-44b9-4c36-adf6-1d69ea615450/Screen_Shot_2021-01-20_at_11.45.00_AM.png)

---

[This skin](https://skins.webamp.org/skin/5447f1bdfd64ffa7b3abe051ad717bcb/Chet_Baker.wsz/) included a file named `secret.txt` which was just a biography of [Chet Baker](https://en.wikipedia.org/wiki/Chet_Baker).

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/a1ef95d4-8330-453f-a3e4-1df46ef9249b/Screen_Shot_2021-01-20_at_11.48.43_AM.png)

---

Some skins included mp3s inside them:

```text
sqlite> SELECT skin_md5, file_name FROM archive_files WHERE file_name LIKE "%.mp3";
105a63846a068bcd2199f3921c006c99|winampme/MSNet d�marrage  Win-Me.mp3
125a87ff1e2b7bce537aa3126b1a80d8|cool.mp3
329105cd7d11d3ec1236a7333a6b46e9|WILLIAM/Winamp Skin/MegaMan/Megaman/[MegaMan X] - X Theme.mp3
57a98f6b68236dd22a006fc8171f94b5|SPARKY.MP3
7653b2504bc3d9404a17c8eca7ba71af|Knuckle-Duster/hagmans_demo.mp3
86080023e53a798ccda91109d33abeb7|arrrrrrg.mp3
9f9c65a5d416d1a97f18dd8488e8cf7b|Blair Amp Project f/Heather_Sorry.mp3
a5a3a08340feb5dae3aa87af698b0654|cool.mp3
b6a51893dde10f4bcbee50a1fa24b217|(Adam Sandler - Billy Madison - Back 2 School).mp3
b6a51893dde10f4bcbee50a1fa24b217|(Mike Myers - Huge Head).mp3
b6cf670eb351e2e76f9048a25aeb639d|Diablo.mp3
b8ba93a4d427d8fd4f4c5fba7bcba627|BROTHEL - Breathe Swallow.mp3
b8ba93a4d427d8fd4f4c5fba7bcba627|BROTHEL - Fuck That Noise.mp3
b8ba93a4d427d8fd4f4c5fba7bcba627|BROTHEL - SunScreen2000.mp3
c647cd24f5809664e0d2e210a68310c1|SKATEBOARDING - Osiris ShoesTheme.mp3
c9b348ae2b93471b76ee2634a12d1dce|The Mark, Tom and Travis show/Blink 182 - Dammit (Sample).mp3
d54e166f5227967e153ec40783473c0b|cos-xenu.mp3
d54e166f5227967e153ec40783473c0b|lrh-xenu.mp3
e47edeecb002afecf1b30ebab8c8d1e9|Destroy v2.0.mp3
fcf17a808fdb485bb3e95a64debea848|Diablo.mp3
```

For example this bizarre five second `cool.mp3`.

[cool.mp3](https://capt.dev/file/gFG874yS3IsXMnlruKWrr/cool.mp3)

---

[This skin](https://skins.webamp.org/skin/fb3b75ccbb49d5d08e54e4705d51bd56/Alien_Workshop_Sovergein_Sect.wsz/) included a file named `Sovergein Sect.wav`.

[Sovergein Sect.wav](https://capt.dev/file/kfYcnkqxmU505ih6dtHws/Sovergein_Sect.wav)

Upon listening it sounded like it was being played backwards, so I reversed the audio file:

[Severgein Sect(reversed).wav](https://capt.dev/file/HFNMgySWlK27_5Bceihx1/Sovergein_Sect_mp3cut.net.mp3)

I think it’s someone saying the name of the skin and some other information?

---

Some days later I found a skin that contained just one file: `WORM.EXE` That sounds dangerous!

I fed it to Virus Total but it didn’t detect any issues. So, someone in the Webamp Discord bravely tried running it in a VM and got this prompt:

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/0c010165-607f-4476-8b84-cb384f3a42f6/unknown.png)

It was a worm _game_, like the game snake!

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/4a0c7793-43a4-41b0-9a86-e99750e33f9f/VxrgXlCeTz.gif)

Here’s top speed:

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/e775bd6e-fab0-4017-8c30-448f0a3f05eb/rgoq4NmUII.gif)

---

Another skin had just one file `Standing around the hoop.jpg`

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/b4461029-d051-4d3e-a6bd-a9925006ab2f/Standing_around_the_hoop.jpg)

---

Another one contained just a single file `ellie.bmp` Here’s Ellie I suppose?

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/000b0643-74f1-4cf5-9592-dc0be20e0ff0/elli.png)

Reencoded as `.png`

---

Another had two new born baby pictures and a text file:

> Here is a few pictures of Dom's baby.
>
> Joe

---

Finally, I thought to look for skins that contained other skins within them, and discovered 127 skins! 54 of which were not already in the museum, so I uploaded them.

![](/notion-mirror/84ebb48c-616a-4f51-ae9a-991a4e0a7e9b/f4239931-353a-4530-8939-80bf9f217673/Screen_Shot_2021-01-24_at_12.51.41_PM.png)

---

It’s so interesting how if you get a large enough number of things that were created by real people, you can end up finding all kinds of crazy stuff! This was such an amazingly strange and  interesting ride!
