/*
Title: How to actively connect to a local Verlihub
Description:
Author: Jordan Eldredge
Date: 2008/01/12
*/

Ever since I moved my DC hub to my apartment, I have been unable to connect to the hub in active mode from a client on the local intranet.

<strong>The solution:</strong>

Set the Verlihub database's alternate_ip variable for your user to your external ip.

The command I issues was:
<code>!regset captbaritone alternate_ip 67.188.34.158</code>

<code></code>
This allowed me to connect to the hub (from the local network) in active mode, without getting kicked for my reported ip (local ip) not matching my "real" ip (external ip).

The only remaining problem, is that I will have to manually change this each time my external ip address changes. I suppose it would be possible to write a deamon to check the address every now and again, and update the mysql database if it changes. But thats a lot of work.