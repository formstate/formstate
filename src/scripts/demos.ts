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
    Once that is done you now get to use your new shiny \`Field\` with complete compile time safety.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/01 basic.tsx',
      height: '200px',
    });

    eze.md(`
    # Validation Triggering

    How you decide to do trigger a validation check depends on the UX you are going for and there are [quite a few options](https://uxdesign.cc/forms-need-validation-2ecbccbacea1). Fortunately by not tieing you in to *our Fields* and letting you create your own means, you can easily make a choice and support the pattern you want in your components.

    The default is the simplest, whenever \`onChange\` is called, a validation request is queued in the field state. So if you edit the below field you will see the error pop up till the field becomes valid.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/02 auto.tsx',
      height: '200px',
    });

    eze.md(`
    You can disable this by passing in \`autoValidationEnabled: false,\` to the FieldState constructor as shown below. Now you get to decide when you want to call \`validate\` e.g. on a button click:
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/03 submit.tsx',
      height: '200px',
    });

    eze.md(`
    However the best place to call \`validate\` is inside an html \`form\` element. The following example demonstrates this.
    > Note that after a failed validation attempt you might want to enable the automatic validation as we do below.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/04 form.tsx',
      height: '200px',
    });

    eze.md(`
    Another common validation pattern is to do it after first blur and then enable it for automatic validation. This can be easily coded into the \`Field\`. Let's recreate our \`Field\` with this behavior baked in:
    `);
    eze.code({
      code: fse.readFileSync(__dirname + '/demos/fieldBlur.tsx').toString().split('export const FieldBlur =')[1],
      mode: 'ts',
    });

    eze.md(`
    Now if you blur on any such \`Field\`s they do a validation and enable autoValidation to guide the user towards a valid state.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/05 blur.tsx',
      height: '300px',
    });

    eze.md(`
    # FormState
    [We think the docs cover it well](https://formstate.github.io). You can also see it in use in onBlur example above as well. But here is another example where we have a the following requirements:

    * nested structure of \`Car\`s containing \`Feature\`s.
    * a Car has a name which is required.
    * a Car must have at least one Feature.
    * each Feature has a name which is required.
    * we want to allow submit only once all these requirements are met.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/06 cars.tsx',
      height: '600px',
    });

    eze.md(`
    # Cross field validation
    You basically compose the FieldStates into a FormState. Then:
    * Display a formError if \`hasFormError\` is \`true\`.
    * Revalidate the form on \`on$ChangeAfterValidation\` on each relevant field.
    `);
    eze.app({
      entryPointPath: __dirname + '/demos/07 cross.tsx',
      height: '300px',
    });
  });
}

/** Also build if the file is required */
buildDemos();
