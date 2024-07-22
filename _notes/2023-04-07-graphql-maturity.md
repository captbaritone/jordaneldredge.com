---
title: A GraphQL Maturity Model
tags:
  - graphql
summary: >-
  I believe the benefits of GraphQL are fundamentally under-realized. Most
  organizations fail to capture much of the value it can provide.
---
_Originally_ [_shared on Twitter_](https://twitter.com/captbaritone/status/1644182593548726274)


I believe the benefits of GraphQL are fundamentally under-realized. Most organizations fail to capture much of the value it can provide.

In thought I’d sketch out a "GraphQL maturity model". How mature is your org? Would you appreciate GraphQL more if you were at 13?


---


1/ Your server supports GraphQL. Your application clients, both mobile and web, are generally able to independently craft their own queries, adding and removing data, without needing to modify server code or worry about impacting other clients.


---


2/ Your types and fields are well documented. [GraphiQL](https://github.com/graphql/graphiql) acts as an internal interactive playground and documentation for your API. Developers can find the data they need and don’t replicate server behavior in multiple places.


---


3/ You are using a GraphQL server and client which both integrate with their respective languages’ type systems. You now have type safety that spans your network API boundary.


---


4/ You have adopted the GraphQL Working Groups [recommended best practice](https://graphql.org/learn/best-practices/#nullability) of making your schema nullable by default. Individual field errors encountered on the server generally manifest as small, handleable, UI errors. Your app’s resilience increases.


---


5/ You adopt the Node specification. Most objects in your graph have a strong ID. Your clients can easily refetch data about individual objects.


---


6/ Your client GraphQL framework uses the strong IDs of the [Node specification](https://graphql.org/learn/global-object-identification/) to store GraphQL data in a normalized form (key ⇒ object). You never have data inconsistency issues between surfaces, and your client uses less memory.


---


7/ Your server implements the [Connections specification](https://relay.dev/graphql/connections.htm) for modeling lists (most UIs are glorified lists). Your client GraphQL framework is able to provide robust pagination that works for all your surfaces.


---


8/ Each of your UI components defines its own data dependencies using a GraphQL fragment. Queries are composed from these fragments. Components can add/remove data locally without having to worry about breaking anyone else.


---


9/ Your client GraphQL framework composes your components’ fragments together into a single query per surface. Your UI loads in a single paint without dozens of loading states. Your users thank you.


---


10/ Your server and client both support [@defer and @stream](https://graphql.org/blog/2020-12-08-improving-latency-with-defer-and-stream-directives/). UX designers can declaratively opt into nested loading states with one line of code directly in their components only where it improves user experience.


---


11/ Your client GraphQL framework leverages each component’s fragment to build targeted subscriptions for each component. Changes to the store result in only the directly affected components rerendering. Your UI is more responsive.


---


12/ Your client engineers are making use of a [GraphQL language server](https://marketplace.visualstudio.com/items?itemName=meta.relay) in their editors. Fields autocomplete with available data. They can hover over fields to see documentation/types. Deprecated fields render as struck through in their IDE.


---


13/ Your client engineers’ GraphQL editor integration supports click-to-definition for fields/types. They can navigate to the server implementation of a field as easily as they can jump to another client function.


---


... this is still just scratching the surface of what's possible today, and I don't think we're near a saturation point.


Every technology has its costs and benefits. But I think GraphQL's costs would feel less painful if its benefits were more broadly realized.

