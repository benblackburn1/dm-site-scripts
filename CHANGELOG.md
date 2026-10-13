# Changelog

## v1.7.0 (2026-10-13)
- Nav dropdowns: hover is now handled by the script, not Webflow. A dropdown opens when its label is hovered and stays open while the cursor is anywhere on the bar or its extended panel; it closes only when the cursor leaves the whole bar (200ms grace). Webflow's hover mode closed it as soon as the cursor left the label and its list. Clicking and tapping still work.
- Nav panel: the dimmed page now starts under the panel's rule, closing the 1 to 2px seam that showed between the line and the dark overlay.

## v1.6.0 (2026-10-13)
- Nav dropdowns: when For Designers or Information opens, the bar's lower edge (its background and bottom rule) eases down under the links, so they sit on the nav colour while the page below is dimmed. On the Home page, where the nav is transparent, the bar turns Longleaf while a dropdown is open. The mobile Menu list is unchanged.

## v1.5.0 (2026-10-12)
- Showroom category row: the arrow buttons and the arrow cursor are gone. The cursor turned every click on the row into a scroll, so visitors could not click a card. On desktop all six cards now fit in one row (Webflow styles); tablets and phones keep swipe scrolling.
- Event RSVP: clicking "RSVP" on any event (Showroom and Community) opens the new RSVP Modal component with the event name and date filled in, instead of opening an email. Closes on Close, the backdrop or Escape.

## v1.4.0 (2026-10-07)
- Event lists on the Showroom and Community pages scroll sideways: one card per event, three to a screen on desktop, two on tablet, one and a bit on phones, with the same arrow buttons as the journal row. Arrows live in a `.events-arrows` element in each events section.

## v1.3.0 (2026-10-07)
- Showroom category row: over the row, the pointer becomes a pistachio green arrow. It points right on the right half of the screen and left on the left half, and a click moves the row one card, the same as the arrow buttons. It dims at the end of the row. Mouse and trackpad only; touch keeps swipe scrolling.

## v1.2.0
- Loader images from the Webflow "DM Load" asset folder.

## v1.1.0
- Nav dropdown drop-in and card image hover.

## v1.0.1
- Native smooth-scroll fallback for hidden tabs.
