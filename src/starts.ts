import { starts } from 'starts';

starts({
  serve: {
    dir: './docs'
  },
  run: [
    { cmd: 'npm run build -- -w', },
    { cmd: 'npm run unittest -- --watch', },
    { cmd: 'npm run docs', },
  ]
});
