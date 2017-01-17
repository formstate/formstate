import * as eze from 'eze';


/** Wrap our builder in a function so it can be waited on by publishDocs */
export function buildDemos() {
  return eze.render({
    outputDir: __dirname + '/../../docs/demos',
    repoUrl: 'https://github.com/formstate/formstate'
  }, (eze) => {
    eze.md(`
    # Creating a Field

    Note that because you write your own Fields you get:
    * To design your fields any way you want with your look an feel.
    * Keep your logic seperate from UI rendering that helps greatly with testing.
    * We can work with complex data types with ease.


    `);
  });
}


/** Also build if the file is required */
buildDemos();
