---
title: "Using Machine Learning to Generate Winamp Skins"
summary: "I used thousands of screenshots of Winamp skins and StyleGAN2 to train an ML model to generate more Winamp skins."
summary_image: /images/six-machine-learning-generated-winamp-skins.png
tags: ["winamp", "ai", "machineLearning", "project"]
---

A while ago I used the large collection of Winamp skin screenshots I created as part of the [Winamp Skin Museum](/blog/winamp-skin-musuem/) to train a [StyleGAN2](https://github.com/NVlabs/stylegan2-ada) machine learning model to generate Winamp skin screenshots.

I don't have a computer that has a serious GPU so I wasn't able to do the training locally. Instead, I followed [this helpful tutorial](https://towardsdatascience.com/run-stylegan2-ada-on-an-aws-spot-instance-in-no-time-d2022fc1e119) which gave clear instructions on how to do StyleGAN training on AWS "spot instances". These are surplus EC2 instances where you get a cheaper price in exchange for the possibility that your instance will get reclaimed arbitrarily.

My original thought was that if the model was able to generate interesting enough looking Winamp skin screenshots, I would start over and try to train a model which would generate the actual Winamp skin sprite sheets, that way it could generate novel, usable Winamp skins.

While I didn't feel like the results were interesting enough to merit that next step, they were still pretty interesting, so I thought I'd share them here.

Six skins generated using the model:

![Six skins generated using the machine learning model](/images/six-machine-learning-generated-winamp-skins.png)

Periodic screenshots of a single seed over the course of training the model:

<video src="/videos/evolution-of-a-winamp-skin.mp4" controls style="image-rendering: pixelated; display: block; margin: 0 auto; margin-bottom: 20px; max-width: 100%;"></video>

For a narrative of my experience generating these, check out this [Twitter thread](https://twitter.com/captbaritone/status/1356836533882425347).

If anyone is interested in picking up where this work left off, or would like access to the model, [please reach out](/contact/) or come drop by the [Webamp Discord server](https://webamp.org/chat).

Special thanks to [Jonathan Fly](https://iforcedabot.com/) for many tips and encouragements.
