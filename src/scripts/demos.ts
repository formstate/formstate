import * as eze from 'eze';
import * as fse from 'fs-extra';


/** Wrap our builder in a function so it can be waited on by publishDocs */
export function buildDemos() {
  return eze.render({
    title: 'FormState demos',
    outputDir: __dirname + '/../../docs/demos',
    repoUrl: 'https://github.com/formstate/formstate'
  }, (eze) => {
    eze.page({
      heading: 'FormState Demos',
      subDirName: 'all'
    })
      .md(`

    > In case you came here directly please note [that we do have hand crafted docs](https://formstate.github.io) which explain a lot of the reasoning behind formstate 🌹

    # Creating a Field

    Note that because you write your own Field components you get:
    * To design your fields any way you want with your look an feel.
    * Keep your logic seperate from UI rendering that helps greatly with testing.
    * We can work with complex data types with ease.

    As an example lets pick an existing UI library called [material-ui](http://www.material-ui.com/).
    `)
      .code({
        code: 'npm install @materialui/core --save-dev',
        mode: 'ts'
      })
      .md(`
    The only difficulty is [reading the material-ui docs to figure out how to create a nice text field](https://material-ui.com/demos/text-fields/). Once that is done we just plonk the provided JSX and wire it to our \`FieldState\`.

    Our \`Field\` will take a \`FieldState\` and render the components (material-ui components in this case, but imagine any styled components you might have ... or create in the future):
    `)
      .code({
        code: fse.readFileSync(__dirname + '/demos/field.tsx').toString().split('// SPLIT HERE')[1],
        mode: 'ts',
      })
      .md(`
    Once that is done you now get to use your new shiny \`Field\` with complete compile time safety.
    `)
      .app({
        entryPointPath: __dirname + '/demos/01 basic.tsx',
        height: '200px',
      })
      .md(`
    # Validation Triggering

    How you decide to do trigger a validation check depends on the UX you are going for and there are [quite a few options](https://uxdesign.cc/forms-need-validation-2ecbccbacea1). Fortunately by not tieing you in to *our Fields* and letting you create your own means, you can easily make a choice and support the pattern you want in your components.

    The default is the simplest, whenever \`onChange\` is called, a validation request is queued in the field state. So if you edit the below field you will see the error pop up till the field becomes valid.
    `)
      .app({
        entryPointPath: __dirname + '/demos/02 auto.tsx',
        height: '200px',
      })
      .md(`
    You can disable this by passing in \`autoValidationEnabled: false,\` to the FieldState constructor as shown below. Now you get to decide when you want to call \`validate\` e.g. on a button click:
    `)
      .app({
        entryPointPath: __dirname + '/demos/03 submit.tsx',
        height: '200px',
      })
      .md(`
    However the best place to call \`validate\` is inside an html \`form\` element. The following example demonstrates this.
    > Note that after a failed validation attempt you might want to enable the automatic validation as we do below.
    `)
      .app({
        entryPointPath: __dirname + '/demos/04 form.tsx',
        height: '200px',
      })
      .md(`
    Another common validation pattern is to do it after first blur and then enable it for automatic validation. This can be easily coded into the \`Field\`. Let's recreate our \`Field\` with this behavior baked in:
    `)
      .code({
        code: fse.readFileSync(__dirname + '/demos/fieldBlur.tsx').toString().split('// SPLIT HERE')[1],
        mode: 'ts',
      })
      .md(`
    Now if you blur on any such \`Field\`s they do a validation and enable autoValidation to guide the user towards a valid state.
    `)
      .app({
        entryPointPath: __dirname + '/demos/05 blur.tsx',
        height: '300px',
      })
      .md(`
    # FormState
    [We think the docs cover it well](https://formstate.github.io). You can also see it in use in onBlur example above as well. But here is another example where we have a the following requirements:

    * nested structure of \`Car\`s containing \`Feature\`s.
    * a Car has a name which is required.
    * a Car must have at least one Feature.
    * each Feature has a name which is required.
    * we want to allow submit only once all these requirements are met.
    `)
      .app({
        entryPointPath: __dirname + '/demos/06 cars.tsx',
        height: '600px',
      })
      .md(`
    # Cross field validation
    Call \`FormState().compose()\` whenever you want to compose the FieldState -> auto validate FormState behaviour. Form validators only run automatically once all the sub Fields (or Forms) are valid, so you don't need to worry about invalid sub fields when doing form validation.
    `)
      .app({
        entryPointPath: __dirname + '/demos/07 cross.tsx',
        height: '300px',
      })
      .md(`
    # Custom type TValue
    A fieldstate can work with any type. The complexity of converting TValue to *display* and calling *onChange* with TValue can all be handled in the field component. E.g. here is a number component.
    `)
      .app({
        entryPointPath: __dirname + '/demos/08 number.tsx',
        height: '300px',
      })
      .md(`
    The number field only allows *valid* numbers to be typed in. If your input allows invalid *strings* to be input then you should do the conversion as needed. E.g. if you use a keyboard driven date input:
    `)
      .app({
        entryPointPath: __dirname + '/demos/09 date.tsx',
        height: '300px',
      })
      .md(`Here you can use the value with a check \`if (!field.hasError) { /* safe to type convert */ }\``);
  });
}

/** Also build if the file is required */
buildDemos();
