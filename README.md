# Tech Talk Session

## Environments
- Preview: https://main--gdc-ui-tech-talk--sselvara.hlx.page/
- Live: https://main--gdc-ui-tech-talk--sselvara.hlx.live/

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Franklin Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)

## Slack Config Details 

1. teamId :- T06DUTYDQ
1. channel :- ui-tech-talk

## Blocks

### labelwithborder

You can author a content title with the help of this block.

### Video List

This block fetches all video lists from `tech-talk-tracker.json` and creates a list.

### Video Search 

This block search list is based on the `tech-talk-tracker.json` `Topic` property.

### Video Filter 

1. This block creates a tag filter based on the `tech-talk-tracker.json` `Tags` property.
2. Filter lists based on the `Tags` property.

### Question Detail

This block shows video details along with video based on `the'selectedVideo` ID. 

### Form

Form block using on two places 

1. Request for a session: we have passed a session request from url `https://main--gdc-ui-tech-talk--sselvara.hlx.page/session-request.json` in this block.

2.  Register Yourself : we have passed a register Yourself from the url `https://main--gdc-ui-tech-talk--sselvara.hlx.page/tech-talk-tracker.json` in this block.
