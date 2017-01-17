import * as eze from 'eze';
import * as fse from 'fs-extra';


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

    Lets create a simple text input field by using [material-ui](http://www.material-ui.com/). First by installing
    `);
    eze.code({
      code: 'npm install material-ui --save-dev',
      mode: 'ts'
    });
    eze.md(`
    Our \`Field\` will take a \`FieldState\` and render the components.

    Internally it wires \`FieldState\` to the input. This is super easy:
    `);
    eze.code({
      code: fse.readFileSync(__dirname + '/demos/field.tsx').toString(),
      mode: 'ts',
    });

    eze.md(`
    Once that is done you now get to use your new shiny \`Field\` with complete safety.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/01 basic.tsx',
      height: '200px',
    });

    eze.md(`
    You can call \`validate\` at any time to validate the field and it flows automatically.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/02 submit.tsx',
      height: '200px',
    });

    eze.md(`
    And the best place to call it is inside an html \`form\` element. The following example demostrates this.

    > Note that we also disable automatic validation when we create the \`FieldState\` below to force you to press enter :)
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/03 form.tsx',
      height: '200px',
    });
  });
}


/** Also build if the file is required */
buildDemos();
