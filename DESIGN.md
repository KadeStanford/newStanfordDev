# Stanford Development Solutions — Design Exploration

Status: Prototype exploration approved by Kade Stanford on September 10, 2026. No production direction is approved yet.

Sources of truth: `BRIEF.md` and `COPY.md`

## Mood-board reading

The supplied mood board contains a consistent visual language even though it does not depict websites:

- Deep navy, cobalt, cyan, teal, ice blue, lavender, and occasional coral or warm light
- Large areas of negative space with one strong focal object
- Natural scale and texture: mountains, ice, water, the moon, and fish
- Synthetic surfaces: glass, chrome, corrugated metal, translucent folds, and luminous ribbons
- Curved layers and diagonal movement rather than boxes arranged on a grid
- A quiet, slightly surreal atmosphere rather than a loud “tech” aesthetic
- Contrast between something monumental and something small or human
- Soft grain, diffusion, refraction, and imperfect texture

These qualities should shape composition, motion, material, scale, and pacing. The site should not reproduce any photographed subject as a brand symbol or copy the composition of an individual image.

One file, `mike-hindle-C6AUqGSAsmg-unsplash.jpg`, could not be rendered by the available image viewer. It is not treated as inspected source material in these proposals.

## Shared rules for every direction

- Keep all approved copy from `COPY.md`; visual exploration is not permission to rewrite it.
- Do not use a standard hero followed by a stack of interchangeable rounded cards.
- Keep the site shorter by allowing visitors to reveal detail instead of displaying every detail at once.
- Keep Work, Services & Pricing, About, and Get in touch directly reachable.
- Use the Big Bass project as the single example in each prototype because it demonstrates both a public site and a working business portal.
- Preserve the contact form's practical purpose and required fields.
- Make the first viewport legible before any interaction begins.
- Motion must have a purpose, work with keyboard and touch input, and respect reduced-motion preferences.
- Mobile is a designed version of the direction, not a collapsed desktop afterthought.
- Avoid fake metrics, decorative dashboards, code-editor windows, generic glowing orbs, and effects that obscure the actual work.
- Use project screenshots as evidence. Use no more than a few mood-setting image assets in the eventual site.

## Technical recommendation

Keep the existing Next.js application and its current architecture. A framework replacement would add migration risk without making the design more original.

The repository already includes enough creative capability:

- React Three Fiber, Three.js, and Drei for one carefully bounded interactive three-dimensional scene
- GSAP for choreographed scroll or mask transitions
- Framer Motion for interface motion and direct manipulation
- Lenis for the existing smooth-scroll behavior
- Embla for a touch-friendly project or pricing rail if the chosen direction needs one

Each direction should use only the smallest useful subset. Combining every animation library would make the site heavier and less coherent.

## Direction 1 — Tidal Glass

### Thesis

A calm, dark digital environment built around one responsive glass form. The interface feels submerged, refracted, and alive without resembling a conventional “futuristic agency” site.

### Mood-board principles to borrow

- The translucent curves and cyan highlights of the glass and ice images
- The deep-water negative space around the fish
- The restrained coral glow seen in the moon and water reflection
- Slow, continuous movement rather than many unrelated entrance animations

### What not to borrow

- No literal fish, mountain, moon, or glacier as a logo
- No full-screen stock-photo slideshow
- No glassmorphism cards layered everywhere
- No generic glowing sphere in the middle of the hero

### Desktop opening

The approved headline sits in a quiet left-hand field with generous space. On the right, a single translucent ribbon-like form responds subtly to pointer movement. The form bends light from a cool cyan field toward a small coral highlight. “Get in touch” remains a solid, unmistakable action rather than becoming part of the artwork.

The form is not merely decorative: as the visitor moves across three labeled edges—Website, Business tools, and Advertising—the object changes its internal structure and reveals one short, approved service explanation.

### Mobile opening

The headline and actions appear first. A smaller touch-responsive form sits below them and can be swiped between the three service states. Reduced-motion mode shows a still rendered image with the same labels and information.

### Big Bass project

The project appears through a large “lens” in the dark field. Dragging the lens across a project screenshot reveals the public website on one side and the working portal on the other. Text and project facts remain visible beside the interaction, so dragging is optional.

On mobile, the comparison becomes an accessible two-position slider with explicit Public site and Business portal labels.

### Contact

The glass form gradually flattens into a bright, readable contact surface. The transition connects the playful object to a practical action; the form itself remains visually simple and easy to complete.

### Likely implementation tools

- React Three Fiber, Three.js, and Drei for the single glass form
- Framer Motion for labels, navigation, and the project comparison
- Lenis for restrained page movement

### Strengths

- Most directly expresses the material quality of the mood board
- Gives visitors something memorable to explore immediately
- Demonstrates technical ability without showing fake code or dashboards

### Risks to control

- WebGL performance on lower-powered phones
- Too much refraction can reduce legibility
- Must provide a strong static and reduced-motion version

## Direction 2 — Alpine Editorial

### Thesis

A cinematic digital field journal: monumental imagery, unusually large spacing, sharp typography, and precise editorial pacing. It feels authored and artistic through composition rather than through a constant special effect.

### Mood-board principles to borrow

- A small human-scale element against a very large landscape
- Cold blue tonal ranges with rare warm interruptions
- Hard mountain diagonals paired with broad, empty sky
- Grain and imperfect printed texture from the cyanotype image

### What not to borrow

- No outdoor-adventure positioning or claims
- No mountain used as a metaphor in the written copy
- No portfolio-template masonry grid
- No ornamental magazine labels that add no meaning

### Desktop opening

The first screen uses an asymmetric editorial spread. The headline occupies a large field of open color. A narrow vertical strip contains location, availability, and navigation. One art-directed image or generated texture interrupts the field near an edge rather than sitting in a standard hero rectangle.

Scrolling behaves like moving through a short visual essay. Content changes scale and alignment from chapter to chapter, but each chapter stays calm and readable.

### Mobile opening

The editorial hierarchy becomes a sequence of strong full-width planes: headline, availability, actions, and image. The narrow desktop index becomes a sticky bottom index with four direct destinations.

### Big Bass project

The project is treated as a feature story rather than a card. One large site image establishes the work. A short vertical sequence then moves from the client's need to the public lead path and finally the working portal. Visitors can open a compact annotated view showing contract signing and invoicing without leaving the page.

### Contact

The final page plane becomes warmer and more personal. “How can I help?” sits beside a clean form with no theatrical interaction competing for attention.

### Likely implementation tools

- CSS layout and typography for most of the experience
- GSAP for a small number of image-mask and chapter transitions
- Lenis for controlled pacing

### Strengths

- Fastest and most resilient direction
- Feels designed without depending on a visual gimmick
- Makes the real client work the main spectacle
- Easiest direction to keep excellent on mobile

### Risks to control

- Requires exceptional typography and image art direction to avoid feeling merely minimal
- Less overtly playful than the other directions

## Direction 3 — The Living Field Guide

### Thesis

The site behaves like an explorable collection of layered specimens. Visitors move through bands, fragments, and translucent materials to discover services and project evidence. It combines the mood board's cyanotype tactility with the movement of its luminous ribbons.

### Mood-board principles to borrow

- Layered paper, cyanotype marks, folded material, and irregular edges
- Repeated ribbons that create rhythm without becoming a grid
- Singular colored objects floating in deep negative space
- The tension between organic texture and clean digital interaction

### What not to borrow

- No scrapbook decorations, tape, stickers, or fake handwritten notes
- No chaotic infinite canvas that hides navigation
- No draggable interaction required to read essential information
- No imitation of museum or archival websites

### Desktop opening

The approved opening copy is anchored in a clear center field. Around it are three slow-moving material bands labeled Website, Business tools, and Advertising. Hovering or dragging a band brings its label forward and exposes a short service excerpt; letting go returns the composition to a calm resting state.

A fixed index keeps Work, Services & Pricing, About, and Get in touch visible while the visual field changes underneath it.

### Mobile opening

The bands become a vertical stack of touchable strips beneath the opening copy. Tapping one expands it in place. The fixed index becomes a compact thumb-reachable menu.

### Big Bass project

The project is a layered specimen: public-site screenshot, portal screenshot, and four factual annotations. Visitors can peel or slide the top layer to reveal the portal, then tap annotations for the approved supporting facts. A conventional “Visit Big Bass Tree Service” link remains present.

### Contact

Selecting Get in touch gathers the scattered material bands into a single quiet column around the form, visually turning exploration into a decision without changing the form's behavior.

### Likely implementation tools

- Framer Motion for drag, spring, and layout-state transitions
- GSAP only if the layered scroll sequence needs tighter choreography
- Existing project images plus one original texture or material asset if later approved

### Strengths

- Most playful and least like a conventional service-business website
- Turns the variety of services into an understandable exploration
- Can feel handcrafted without pretending to be analog

### Risks to control

- The playful surface cannot delay access to services, pricing, or contact
- Requires careful touch behavior and strong focus states
- Too many layers would recreate the clutter the redesign is meant to remove

## Recommendation

Direction 1, Tidal Glass, is the strongest direct translation of the mood board and the clearest demonstration of technical craft. Direction 3, The Living Field Guide, is the more unusual interaction concept and may better satisfy the desire for visitors to explore and play. Direction 2, Alpine Editorial, is the safest balance of artistry, credibility, performance, and clarity.

The decision should be based on which quality matters most:

- Tidal Glass: immersive material and technical presence
- Alpine Editorial: cinematic restraint and focus on the work
- The Living Field Guide: tactile exploration and playful discovery

## Prototype boundary

After Kade selects one or more directions to prototype, each approved prototype will contain only:

- Navigation
- The opening
- The Big Bass project example
- The contact section
- Desktop and mobile behavior

The prototypes will use approved copy and existing project evidence. Services, full pricing, About, legal pages, admin features, and production integration remain outside the prototype boundary.

## Review prototypes

### Tidal Glass revision — September 10, 2026

Further revision requested after the second study: central interactive glass composition, three interpolated silhouettes controlled by service selection, faster visible deformation, and an explicit motion override. Fixed the previous control logic which could never resume animation when reduced motion was enabled. The default still respects that preference, while Enable motion allows deliberate opt-in. Desktop and mobile rendered previews and service selection were checked. Production direction remains unapproved.

Kade requested a more advanced revision of theme 1 only; this is authorized prototype work, not production approval. Replaced the tube meshes with a custom GLSL surface rendered through React Three Fiber and Three.js: animated surface normals, chromatic refraction, Fresnel reflection, and pointer distortion. Typography now overlaps the visual field; the Big Bass image occupies a full-width project stage. Added a motion pause control and reduced-motion support. Business-tool details are explanatory text, not a screenshot of the actual private portal. Themes 2 and 3 remain unchanged.

The three approved, isolated prototypes are available at:

- `/prototypes/tidal-glass`
- `/prototypes/alpine-editorial`
- `/prototypes/living-field-guide`

These routes are design studies only. Approval to prototype does not approve any direction for production implementation.

## Full local redesign — September 10, 2026

The subsequent request, “run the dev server in the background while you work and begin on that, do not stop until you complete the full redesign,” authorizes full local implementation beyond the earlier static-study boundary. It does not constitute visual acceptance of the result or permission to deploy. The previous prototypes are preserved.

Implemented direction: a full-viewport, draggable folded-glass composition built with the existing React Three Fiber, Drei, and Three.js dependencies. Fold, Unfold, and Fan controls change its composition; arrow controls provide an alternative to dragging. The scene rotates slowly, stops rendering offscreen, and has an explicit effects toggle. Reduced-motion and coarse-pointer devices start with a static alternative and can opt into 3D.

The public homepage now includes the approved opening, both real projects, expandable services and pricing, About, process, and contact. Contact has a matching standalone page. COPY.md remains the build-time source for the portfolio copy; BRIEF.md remains authoritative for business facts. Mood images are not presented as client work. Existing API, legal, admin, analytics, and email infrastructure are retained.

Visual rules: dark blue-green opening and service surfaces, pale project and About surfaces, oversized restrained typography, genuine project screenshots, and compact native disclosures rather than repeated marketing cards. Primary navigation and contact remain ordinary accessible HTML outside the canvas. No essential content requires WebGL.

Visual acceptance is pending Kade's review. See REDESIGN_QA.md for performed checks and remaining verification.

## Project-led opening revision

### Lower-page continuation — September 10, 2026

Kade requested extending the redesigned hero's structure and visual language through the remaining homepage. Implemented dark ink surfaces, lime accents, thin dividers, restrained typography, rounded outlined actions, and framed imagery throughout Work, Services/Pricing, About, contact, navigation, and footer. Work now pairs project details with a single interactive gallery rather than repeating the homepage screenshot. Phone layouts put the gallery ahead of supporting details. Existing copy, prices, form logic, and hero interactions remain unchanged. This is local implementation for review, not visual acceptance or deployment approval.

Verification: direct Next production build passed (the system npm launcher was broken, so Next's installed CLI was used). Inspected screenshots of Work, Pricing, About, and contact at 1440px and 390px; neither viewport had horizontal document overflow. Gallery selection and dialog opening, Escape dismissal, and empty-form name validation were exercised without sending email. Physical-device testing and a full accessibility audit remain pending.

Kade rejected the sculpture-led design and authorized the proposed opening-to-project revision. The homepage now uses two genuine project screenshots as selectable perspective layers, with pointer-reactive depth and an expandable project-focus panel. It uses CSS 3D transforms rather than a WebGL sculpture. The sculpture component and earlier commits remain available for rollback. No approved business copy, dependencies, or backend workflows were changed. This is the first opening-to-project slice; the lower sections retain their previous layout pending review of this direction. Visual acceptance remains pending.

Checks for this slice: Next production build passed; desktop (1440 × 1000) and phone (390 × 844) screenshots inspected; project switching and expanded facts observed; no horizontal overflow at the checked phone width. Pointer-reactive movement, physical-device performance, and a complete keyboard audit remain unverified.
