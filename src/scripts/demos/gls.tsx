/**
 * This is a level above csstips
 *  - It wraps up the csstips primitives into components
 */
import * as csstips from 'csstips';
import * as typestyle from 'typestyle';
import * as React from "react";

/**
 * Defaults used in layout
 */
export let defaultValues = {
  verticalSpacing: 24,
  horizontalSpacing: 24,

  breakpoints: {
    phone: 480,
  }
}
export function setDefaults(defaults: typeof defaultValues) {
  defaultValues = defaults;
}

declare global {
  interface Function {
    displayName?: string;
  }
}

/********
 *
 * Primitives
 *
 ********/

/**
* For that time you just need a visual vertical seperation
*/
export const SmallVerticalSpace = (props: { space?: number }) => {
  return <div style={{ height: props.space || defaultValues.verticalSpacing }}></div>;
}
SmallVerticalSpace.displayName = "SmallVerticalSpace";

/**
 * For that time you just need a visual horizontal seperation
 */
export const SmallHorizontalSpace = (props: { space?: number }) => {
  return <div style={{ width: props.space || defaultValues.horizontalSpacing, display: 'inline-block' }}></div>;
}
SmallVerticalSpace.displayName = "SmallHorizontalSpace";

export interface PrimitiveProps extends React.HTMLProps<HTMLDivElement> { };

namespace ClassNames {
  export const content = typestyle.style(csstips.content);
  export const flex = typestyle.style(csstips.pass, csstips.flex);
  export const flexScrollY = typestyle.style(csstips.pass, csstips.flex, csstips.vertical, { overflowY: 'auto' });
  export const pass = typestyle.style(csstips.pass);
  export const contentVertical = typestyle.style(csstips.content, csstips.vertical);
  export const contentVerticalCentered = typestyle.style(csstips.content, csstips.vertical, csstips.center);
  export const flexVerticalCentered = typestyle.style(csstips.flex, csstips.vertical, csstips.center);
  export const contentHorizontal = typestyle.style(csstips.content, csstips.horizontal);
  export const contentHorizontalCentered = typestyle.style(csstips.content, csstips.horizontal, csstips.center);
  export const flexHorizontalCentered = typestyle.style(csstips.flex, csstips.horizontal, csstips.center);
  export const flexVertical = typestyle.style(csstips.flex, csstips.vertical, { maxWidth: '100%' /*normalizing browser bugs*/ });
  export const flexHorizontal = typestyle.style(csstips.flex, csstips.horizontal);
}

/**
 * Generally prefer an inline block (as that will wrap).
 * Use this for critical `content` driven *vertical* height
 *
 * Takes as much space as it needs, no more, no less
 */
export const Content = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.content, props.className);
  return (
    <div data-comment="Content" {...props} className={className} />
  );
};
Content.displayName = "Content";

/**
 * Takes as much space as it needs, no more, no less
 */
export const InlineBlock = (props: PrimitiveProps) => {
  const className = typestyle.classes(typestyle.style({ display: 'inline-block' }), props.className);
  return (
    <div data-comment="InlineBlock" {...props} className={className} />
  );
};
InlineBlock.displayName = "InlineBlock";


/**
 * Takes up all the parent space, no more, no less
 */
export const Flex = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.flex, props.className);
  return (
    <div data-comment="Flex" {...props} className={className} />
  );
};
Flex.displayName = "Flex";

/**
 * Takes up all the parent space, no more, no less and scrolls the children in Y if needed
 */
export const FlexScrollY = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.flexScrollY, props.className);
  return (
    <div data-comment="FlexScrollY" {...props} className={className} />
  );
};
FlexScrollY.displayName = "FlexScrollY";

/**
 * When you need a general purpose container. Use this instead of a `div`
 */
export const Pass = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.pass, props.className);
  return (
    <div data-comment="Pass" {...props} className={className} />
  );
};
Pass.displayName = "Pass";

/**
 * Provides a Vertical Container. For the parent it behaves like content.
 */
export const ContentVertical = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.contentVertical, props.className);
  return (
    <div data-comment="ContentVertical" {...props} className={className} />
  );
};
ContentVertical.displayName = "ContentVertical";

/**
 * Quite commonly need horizontally centered text
 */
export const ContentVerticalCentered = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.contentVerticalCentered, props.className);
  return (
    <div data-comment="ContentVerticalCentered" {...props} className={className} />
  );
}
ContentVerticalCentered.displayName = "ContentVerticalCentered";

/**
 * Quite commonly need horizontally centered text
 */
export const FlexVerticalCentered = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.flexVerticalCentered, props.className);
  return (
    <div data-comment="FlexVerticalCentered" {...props} className={className} />
  );
}
FlexVerticalCentered.displayName = "FlexVerticalCentered";

/**
 * Provides a Horizontal Container. For the parent it behaves like content.
 */
export const ContentHorizontal = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.contentHorizontal, props.className);
  return (
    <div data-comment="ContentHorizontal" {...props} className={className} />
  );
};
ContentHorizontal.displayName = "ContentHorizontal";

/**
 * Provides a Horizontal Container and centers its children in the cross dimension
 */
export const ContentHorizontalCentered = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.contentHorizontalCentered, props.className);
  return (
    <div data-comment="ContentHorizontalCentered" {...props} className={className} />
  );
};
ContentHorizontalCentered.displayName = "ContentHorizontalCentered";

/**
 * Provides a Vertical Container. For the parent it behaves like flex.
 */
export const FlexVertical = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.flexVertical, props.className);
  return (
    <div data-comment="FlexVertical" {...props} className={className} />
  );
};
FlexVertical.displayName = "FlexVertical";

/**
 * Provides a Horizontal Container. For the parent it behaves like flex.
 */
export const FlexHorizontal = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.flexHorizontal, props.className);
  return (
    <div data-comment="FlexHorizontal" {...props} className={className} />
  );
};
FlexHorizontal.displayName = "FlexHorizontal";

/**
 * Provides a Horizontal Container and centers its children in the cross dimension
 */
export const FlexHorizontalCentered = (props: PrimitiveProps) => {
  const className = typestyle.classes(ClassNames.flexHorizontalCentered, props.className);
  return (
    <div data-comment="FlexHorizontalCentered" {...props} className={className} />
  );
};
ContentHorizontalCentered.displayName = "FlexHorizontalCentered";

/********
 *
 * Grid System
 *
 ********/
export interface MarginedProps extends PrimitiveProps {
  margin?: number;
}

export const ContentHorizontalMarginedCentered = (props: MarginedProps) => {
  const { margin, ...otherProps } = props;

  const spacing = (margin == null ? defaultValues.horizontalSpacing : margin);
  const className = typestyle.classes(props.className, typestyle.style(csstips.center, csstips.horizontallySpaced(spacing)));

  return (
    <ContentHorizontal {...otherProps} className={className} data-comment="ContentHorizontalMarginedCentered" />
  );
}
ContentHorizontalMarginedCentered.displayName = "ContentHorizontalMarginedCentered";

/**
 * Lays out the children horizontally with
 * - Parent: gets to chose the Width
 * - ThisComponent: gets the overall Height (by max) of the children
 * - Children: get the Width : equally distributed from the parent Width
 * - Children: get the Height : sized by content
 * - ThisComponent: Puts a horizontal margin between each item
 */
export const FlexHorizontalMargined = (props: MarginedProps) => {
  const { margin, ...otherProps } = props;

  const spacing = (margin == null ? defaultValues.horizontalSpacing : margin);
  const className = typestyle.classes(props.className, typestyle.style(csstips.horizontallySpaced(spacing)));

  return (
    <FlexHorizontal {...otherProps} className={className} data-comment="FlexHorizontalMargined" />
  );
}
FlexHorizontalMargined.displayName = "FlexHorizontalMargined";

export const FlexVerticalMargined = (props: MarginedProps) => {
  const { margin, ...otherProps } = props;

  const spacing = (margin == null ? defaultValues.verticalSpacing : margin);
  const className = typestyle.classes(props.className, typestyle.style(csstips.verticallySpaced(spacing)));

  return (
    <FlexVertical {...otherProps} className={className} data-comment="FlexVerticalMargined" />
  );
}
FlexHorizontalMargined.displayName = "FlexVerticalMargined";

/**
 * Just a display:block with vertical spacing between each child
 */
export const VerticalMargined = (props: MarginedProps) => {
  const { margin, ...otherProps } = props;

  const spacing = (margin == null ? defaultValues.verticalSpacing : margin);
  const className = typestyle.classes(props.className, typestyle.style(csstips.verticallySpaced(spacing)));

  return (
    <div {...otherProps} className={className} data-comment="VerticalMargined" />
  );
}
VerticalMargined.displayName = "VerticalMargined";

/**
 * If you want a constrained max width layout
 */
export const MaxWidth = ({ maxWidth, children }: { maxWidth: number, children?: React.ReactNode }) => {
  return <div style={{ maxWidth: maxWidth + 'px' }} children={children} />
}


//////////////////////
// AP core page layout components
//////////////////////
export type VerticalProps = MarginedProps & {
  maxWidth?: number,
  horizontalAlign?: 'left' /** default */ | 'center',
};
/**
 * Could be ContentVerticalMargined but also wraps each child in Content to auto fix IE vertical layout issues
 */
export const Vertical = (props: VerticalProps) => {
  const { margin, children, maxWidth, horizontalAlign, ...otherProps } = props;

  const spacing = (margin == null ? defaultValues.verticalSpacing : margin);
  const className = typestyle.classes(
    props.className,
    typestyle.style(csstips.verticallySpaced(spacing)),
    maxWidth != null && typestyle.style({ maxWidth: maxWidth + 'px' }),
    horizontalAlign == 'center' && typestyle.style(csstips.center),
  );

  return (
    <ContentVertical {...otherProps}
      className={className}
      data-comment="Vertical">
      {
        React.Children.toArray(children).filter(c => !!c).map((child, i) => <Content key={(child as any).key || i}>{child}</Content>)
      }
    </ContentVertical>
  );
}
Vertical.displayName = "Vertical";

/**
 * Lays out the children horizontally with
 * - ThisComponent: gets the overall Height (by max) of the children
 * - Children: get the Width : equally distributed from the parent Width
 * - Children: get the Height : sized by content
 * - ThisComponent: Puts a horizontal margin between each item
 */
export const Horizontal = (props: MarginedProps & {
  horizontalAlign?: 'left' /** default */ | 'right',
  verticalAlign?: 'top' /** default */ | 'center'
}) => {
  const {
    margin,
    horizontalAlign,
    verticalAlign,
    ...otherProps } = props;

  const spacing = (margin == null ? defaultValues.horizontalSpacing : margin);
  const className = typestyle.classes(props.className,
    typestyle.style(csstips.horizontallySpaced(spacing)),
    horizontalAlign == 'right' && typestyle.style(csstips.endJustified),
    verticalAlign == 'center' && typestyle.style(csstips.center),
  );

  return (
    <ContentHorizontal {...otherProps} className={className} data-comment="Horizontal" />
  );
}
Horizontal.displayName = "Horizontal";

/**
 * Responsive Container
 */
export interface ResponsiveGridParentProps extends PrimitiveProps {
  /** Margins in vertical mode */
  verticalMargin?: number;
  /** Margins in horizontal mode */
  horizontalMargin?: number;

  breakpoint?: number;
  /** Alignment in horizontal mode */
  horizontalAlign?: 'top' /** Default */ | 'center';
}
export const Responsive = (props: ResponsiveGridParentProps) => {
  const { verticalMargin, horizontalMargin, breakpoint, horizontalAlign, ...otherProps } = props;

  const spacingVertical = (verticalMargin == null ? defaultValues.verticalSpacing : verticalMargin);
  const spacingHorizontal = (horizontalMargin == null ? defaultValues.horizontalSpacing : horizontalMargin);

  const breakpointNum = (breakpoint || defaultValues.breakpoints.phone)

  const children = React.Children.toArray(props.children).filter(c => !!c);

  const alignment =
    horizontalAlign === 'center' ? [csstips.flexRoot, csstips.center]
      : [csstips.flexRoot, csstips.start];

  const parentClassName = typestyle.classes(
    props.className,
    typestyle.style(
      csstips.layerParent,
      /** Lower than breakpoint: Vertical Margined */
      typestyle.media({ minWidth: 0, maxWidth: breakpointNum }, csstips.verticallySpaced(spacingVertical)),
      /** Bigger than breakpoint: Horizontal Margined */
      typestyle.media({ minWidth: breakpointNum + 1 }, csstips.horizontallySpaced(spacingHorizontal), ...alignment),
    )
  );

  const childClassName = (className: string) => typestyle.classes(
    className,
    typestyle.style(
      csstips.inlineBlock,
      /** Lower than breakpoint: full sized */
      typestyle.media({ minWidth: 0, maxWidth: breakpointNum }, { width: '100%' }),
      /** Bigger than breakpoint: percent sized */
      typestyle.media({ minWidth: breakpointNum + 1 }, { width: `calc(${(1 / children.length) * 100}% - ${spacingHorizontal - spacingHorizontal / children.length}px)` }),
    )
  );

  return (
    <div {...otherProps} className={parentClassName} data-comment="Responsive">
      {
        children.map((child, i) => <div data-comment="ResponsiveChild" key={(child as any).key || i} className={childClassName((child as any).className)}>{child}</div>)
      }
    </div>
  );
}
Responsive.displayName = "Responsive";
