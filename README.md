# DataVis-Demo

[Check out the Demo-Application online!](https://luke5.github.io/DataVis-Demo/ "Demo Application")

## Project presentation of a web based data visualisation of a multivariate data-set using parallel coordinates
This application visualises personal data using parallel coordinates. Parallel coordinates are a visualisation technique introduced by Inselberg in 1990 that enables multivariate data to be displayed in two-dimensional space. The individual attributes of an n-dimensional data set are mapped to one coordinate axis each. The coordinate axes are arranged parallel and equidistant to each other, thus enabling all visualised attributes to be treated equally. The value range of each attribute is scaled to the constant height of the coordinate axes. A data object is represented by a polyline that intersects all axes at the height of the respective attribute value.

The following figure shows an example of a visualisation with parallel coordinates based on the application presented.

![Example_of_PCP](https://github.com/Luke5/DataVis-Demo/assets/15120204/9659042d-0ab6-4142-a4ac-40264cb84ad7 "Example of a parallel coordinates plot as used in the application")

### Advantages
- Good overview of value distributions
- High attribute visibility
- Correlations between neighbouring axes are clearly visible

### Disadvantages
- Recognisability of correlations depends on the axis arrangement
- Overloaded display with large data sets (visual clutter)
- Problems with scalability
- Low object visibility

## Objective
The aim of every visualisation is to reveal hidden correlations in the data through a suitably selected visual data representation and to enable a deeper understanding of the properties of the data set. Since parallel coordinates are used to visualise large multivariate data sets and the technology supports high attribute visibility due to the different axes for the individual attributes, the focus is on finding correlations between the individual data attributes. With regard to correlations, the primary interaction tasks to be accomplished with the application are as follows:

1. explorative analysis - users explore the data set in **search of hypotheses** about the relationship between individual attributes (e.g. attribute A (does not) correlate with attribute B)
2. affirmative analysis - users can use the application to **verify or refute** their **existing hypotheses** (e.g. assumption that there is a correlation between attribute A and attribute B)

However, these two analysis techniques do not have to relate exclusively to correlations between the attributes (axes). The **comparison of individual data objects** (lines) with each other is also a conceivable interaction task. The application must therefore not only enable the visual analysis of attribute correlations, but should also implement measures to improve object visibility and compare multiple data lines.

The following section provides an overview of the specific sub-goals derived from these primary goals and the respective concepts that are intended to support the user in achieving these goals. A detailed explanation of the implemented design concepts is provided later in the section on functional scope in combination with instructions for use.

- Finding correlations between selected attributes: `Users must be able to select/deselect axes`
- Investigate correlation between two (neighbouring) attributes: `Users must be able to vary the arrangement of the axes, as it is difficult to follow line progressions across several axes if the line style is the same`
- Overview of the course of lines with a specific attribute characteristic: `Users must be able to colour data lines according to the attribute value in order to perceive them preattentively (colourisation)`
- Reduction of visual clutter; investigation of correlations only for certain sections of the value range of attributes: `Users must be able to reduce the number of displayed lines by interactively restricting the value range of various attributes (brushing)`
- Permanent reduction of the data set to data objects "of interest" (= with a special value range); "zooming in" on the data selection by scaling the axes accordingly: `Users must be able to remove data objects that are not within the value range they want to analyse (Keep & Extract)`
- Estimation of the general frequency distribution of certain attribute values; making exact statistical statements: `Users must be able to precisely determine average values, outliers, etc. for the individual attributes (box plots)`
- Reading exact values for attribute values: `Users must be given specific numerical values or similar for attribute values if these cannot be read exactly from the axis (details on demand)`
- Tracking a data object across multiple axes: `Users must be able to highlight data lines by hovering over them in order to track their progress. It should also be possible to permanently select the data line.`
- Comparison of multiple data objects: `Users must be able to select and highlight multiple data lines. Their attribute values must be visualised in a form that supports object visibility (Details on Demand, Starplot)`
- Return data sets to their original state: `Users must be able to undo certain changes to the dataset (history)`

## Data collection

Parallel coordinates are particularly suitable for visualising large multivariate data sets. For the use of this visualisation technique to be worthwhile, the data set to be visualised should include a sufficiently large number of attributes (axes) and data objects (lines). Furthermore, one of the main tasks in the exploration of parallel coordinate visualisations is to find correlations between individual attributes. In order to fulfil these requirements, we collected personal data from a wide variety of everyday areas, which at first glance hardly suggest any obvious correlations and offer plenty of scope for exploration.

During data collection, each of the five team members recorded personal data in 19 different data dimensions on a daily basis over a period of 21 days. This resulted in 105 multivariate data objects, represented in a parallel coordinate system with a maximum of 22 axes (19 personal data attributes as well as axes for date, day of the week and person).

### Time of day 
- When did you wake up? (time of day)
- When did you go to bed? (time of day)
- When did you have lunch? (time of day)
### Time duration
- Working time (hours)
- Time at university (hours)
- Time at sports (hours)
- Computer use (hours)
- Time spent on mobile phone (hours)
### Diet 
- What did you eat for lunch? (Enumeration)
- Where did you have lunch? (Enumeration)
- Alcohol consumption (units)
### Social
- Number of personal contacts (integer)
- Colour of the top worn (string)
- Subjective feeling of well-being/happiness (integer from [0, 10])
### Miscellaneous
- Number of kilometres travelled (km)
- Number of steps climbed (integer)
- Number of doors passed through (integer)
- Number of streets crossed (integer)
- Amount of money spent (Euro)

## Features

![Features](https://github.com/Luke5/DataVis-Demo/assets/15120204/3a173e95-ebe6-4d6e-9a7c-32b8978494a0 "Features of the application")

### Selecting and rearranging axes

Due to the limited screen space, only a limited number of axes can be displayed next to each other at the same time without restrictions. The maximum number of axes displayed here is limited to seven. The user has the option of selecting and deselecting individual axes according to their interests via the sidebar. Axes can also be deactivated directly via the axis overlay. 

If correlations between attribute axes are to be read off, it is necessary to visually trace the lines between the axes. With identical line styles, this is only possible without restriction between directly neighbouring axes. Axes can therefore be moved horizontally as required using drag & drop on the axis name and can be reorganised. For example, by always arranging qualitative and quantitative axes alternately, it is also possible to "fan out" lines that would otherwise run on top of each other.

![left_part](https://github.com/Luke5/DataVis-Demo/assets/15120204/557c649c-a86c-43f0-9470-47f1e3008ee1 "left part of the UI")

### Colorisation

By opening the sidebar, you have the option of colouring all currently displayed lines by category using a drop-down menu. The categories person, day of the week, meal and no colouring are available for selection. We agreed on these four options in our team, firstly because we wanted to keep the list small and secondly because we only wanted to select the most relevant attributes. In our opinion, it only makes sense to colour qualitative attributes because they provide the clearest colouring. We considered numerical values to be inappropriate due to the possibly too large and confusing colour spectrum.

Colouring makes it easier to identify correlations between the coloured attributes and the rest and to draw general conclusions. We also found that it is much easier to distinguish and follow the individual lines using colours with subtle contrast, which in turn makes further exploration of the data easier.

### Brushing

The large number of data lines displayed makes it essential to filter the data set in order to recognise details in the data. Parallel coordinates are usually filtered by interactively restricting the value range of individual axes (so-called brushing). By "crossing out" the desired value range on the axis with the mouse, only those lines whose values of the brushed attribute lie within this value range are highlighted. Filtering with interrupted value ranges on axes is made possible by multibrushing. In addition, four different brush modes (And, Or, Nand and Nor) have been implemented to create customised filters, which can be set via the menu at the top of the screen. The mode of operation of the individual brush modes is explained in the following figure. Filters created with Brushing form the basis for Keep and Extract operations and also influence the display of box plots.

![Comparison](https://github.com/Luke5/DataVis-Demo/assets/15120204/a1d6a8b3-2eb8-4d66-9f4f-58fe06920587 "Comparison of different brush modes (example)")

> Top left: **AND-Brushing (default)**: only lines for which `Person = Lukas` or `Person = Marc` and `Lunch = meat` are highlighted  
> Top right: **OR-Brushing**: Lines with `Person = Lukas`, lines with `Person = Marc` and lines with `Lunch = meat` are highlighted  
> Bottom left: **NAND brushing**: like AND brushing, but the lines are greyed out instead of highlighted  
> Bottom right: **NOR brushing**: like OR brushing, but the lines are greyed out instead of highlighted  


### Keep & Extract (with Revert)

The buttons for these two functions can be found in the top menu. "Keep" keeps the lines selected by the brushes and deletes all others from the existing data set. "Extract", on the other hand, keeps all unselected lines and deletes those within the scope of the brushes. The original data set can be restored by either going back step by step using the button next to it (History) or by resetting the view to the initial state using the "Reset View" button in the sidebar.

The functions are intended to help the user to explore and analyse a selected data set more quickly and efficiently. By removing data lines, visual oversaturation is reduced, making it easier to recognise the target quantity. A keep/extract is also associated with a rescaling of all coordinate axes to the value range of the reduced data set. This results in an "indirect" zoom, which contributes to better recognisability of individual lines.

### Boxplots

A boxplot can be displayed for each axis that depicts numerical or time values. The boxplot makes it possible to quickly recognise distributions on this axis. It converts the implicit knowledge of the distribution, which the data lines themselves already show, into an explicit representation and thus relieves the user of cognitive activities. In addition to the use of the boxplot with axes in general, a combination with brushes is also possible. As the data set is selected by the brushes, the boxplot is based on other data. This leads to a direct change in the boxplot. The separate display of the distribution by the boxplot allows a user to recognise a change caused by the selection very quickly. However, a boxplot is only drawn if there are at least five data objects in the brush. Boxplots can be switched on/off for the individual axes via the corresponding axis overlay.

### Axis overlay

As the user can perform a number of different axis-specific interactions, a context menu has been developed for the axes. This can be called up by clicking on the axis name. It contains functionalities such as displaying the box plot, inverting the axis coatings or hiding the axis itself. However, the provision of other functionalities would also be conceivable. By directly linking the specific interactions to the axes on which they are to be executed, the user can quickly select the desired functionality. The context menu is also only called up when the user needs it and therefore does not waste any unnecessary space.

### Inverting axis plots

With parallel coordinates, there is the problem that neighbouring axes have different distributions. This can result, for example, in a collection of many elements at the lower end of one axis and a collection at the upper end of another axis. As a result, all data lines between these two axes are difficult to recognise as they overlap. To partially solve this problem, an inversion of the axis coatings was implemented. This gives the user the chance to bring such distributions to the same vertical position (upper or lower end of the axis).

### Hover and selection of data lines

Due to the large number of different data lines, some of which overlap, it is very difficult to recognise and track a single data line. To simplify this activity, a hover has been integrated on the data lines. This allows the user to hover over a desired data line to highlight it and thus be able to follow it in the set of all lines. However, this highlighting is only temporary and disappears as soon as the user stops hovering over the object. As a user wants to compare several data lines in this way, a selection of data lines has been introduced. To do this, the user clicks on the desired data object. This is then highlighted and remains highlighted regardless of the mouse position. To return a selected line to its original display, the user can click on it again or delete the entire selection at once to deselect not just one, but all data lines.

### Details on demand with Starplot

In the set of data lines, it is difficult to compare and track two data lines. The star plot is an alternative representation for some attributes of the parallel coordinates. A star plot offers an iconic graphical representation that is easy to compare with others due to its shape. It enables a comparison of individual attributes, but also of two data lines as a whole. The data lines each represent persons, so that a comparison between different persons is possible, but also a comparison of a person on different days.

The star plot is linked to the concept of hovering and selecting data lines and works in the same way. It provides an additional form of visualisation of information.

![right_part](https://github.com/Luke5/DataVis-Demo/assets/15120204/71f7c94d-4b7d-4648-a499-2ae7834849c2 "right part of the UI")

The exact attribute values for a hovered data object are shown categorised in an accordion to the right of the star plot. If a data line has also been selected by clicking on it, its attribute values are also displayed next to those of the hovered line to make it easier to effectively compare two data objects. The data line that was clicked last is always selected.

## Further concepts

The following features were not implemented as part of the application and are intended to provide an outlook on further possibilities for improvement.

### Moving ticks on axes

For axes that are not based on time or numerical data, the arrangement of the values is quite random. In the case of days of the week, for example, the data values are arranged in order (i.e. ordinal scales), but for others, such as the top colour, it is only alphabetical. As this can result in a certain grouping of data lines, which the user does not want, it is conceivable that the user can customise the order of the axis ticks. It is therefore conceivable that the user could drag and drop the desired ticks to a different position. This can also lead to visual clutter being cancelled by the data lines, as fewer data lines cross between the axes.

### Zoom/fish eye on an axis

With parallel coordinates, there may be certain values on axes that are intersected by a large number of data lines at the same time. As this makes it impossible to track a single line, it is conceivable to use a local zoom on a certain area of an axis. This means that a single value can no longer be found at a single position, but over a certain distance. As a result, different data lines can be displayed on top of each other and thus tracked. A conventional zoom is not always desirable for a user, as they only select a certain area and thus lose the wider context of the axis. It is therefore conceivable to use a fish-eye distortion, which only takes place along the axis. This means that all axis ticks are retained.

### Logarithmic axis coatings

In addition to linear axis ticks, logarithmic ticks are also conceivable. Especially for axes with a large spread of data, this enables a more even representation of the values. This also reduces the visual clutter caused by the superimposition of many data lines.

## Implementation

### Structure of the application

The application has been divided into various files. The `index.html` represents the starting point of the programme and contains the basic structure of the website. The implementation of the script can be found in `main.js`. This handles the creation of the diagram, reading in the data, brushing and other functionalities as well as visualisations such as the starplot. The basis of the starplot can be found in `Radarchart.js`. The boxplot and the axis overlay were also moved to an extra file (`boxplot.js` and `axis_overlay.js`) to ensure a better overview of the code. Most of the adjustments for the visualisation of the entire application were made in `main.css`, but some were also stored directly in `index.html`. The collected data is stored in the `data.csv` file as comma separated values and is read in using `d3.js` and converted into JSON.

### Tools and libraries

The Parallel Coordinates Plot was implemented as a web application. This application was implemented with Javascript, HTML and CSS. D3, an open-source JavaScript library for visualizing data was used in version 4. jQuery and materialize.css were used to support quick development.
