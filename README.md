An online quick chat application created in react using Redis pub/sub system. Users can create a chat room or join an existing chat room with any name, without the need to give any personal information (Email or phone number). After the web-socket connection ends the room is completely disposed.

It comprises of a React frontend and an Express backend.

For each chat room, a channel is created in the Redis Pub/Sub system to which all the room members are made to subscribe. Any new message from a member is published to this channel and hence received by all other members.

Singleton design pattern is used for managing frontend's web-socket connection to the backend and backend's connection to the remote redis instance.

React state management library used - Recoil

Typescript is used as the primary language.

UI library - Tailwind CSS, Material-Tailwind, Framer motion

Fully responsive using Flexbox and MediaQueries.

Deployed at vercel - https://chatnow-frontend.vercel.app/