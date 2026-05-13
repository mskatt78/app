"""
Script to add deeper teachings to all Masculine Embodiment practices.
Run with: cd /app/backend && python3 -c "import asyncio; from data.deepen_masculine import update_masculine; asyncio.run(update_masculine())"
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

MASCULINE_DEEPER_TEACHINGS = {
    "heart-king-practice": {
        "deeper_teaching": """The Heart-Centered King: Leading from Love

The King archetype, when healthy, is perhaps the most needed energy on Earth right now. Not the tyrannical king who dominates, not the weak king who abdicates, but the heart-centered king who leads with love while holding firm boundaries.

THE MATURE MASCULINE LEADER

The King represents mature masculine energy that has integrated Warrior, Lover, and Sage. He has the Warrior's strength but doesn't need to prove it. He has the Lover's feeling but isn't ruled by it. He has the Sage's wisdom and uses it in service.

This archetype isn't about gender—women also have King energy. It's the part of us that takes responsibility, creates order, and uses power in service of others.

GOOD KING VS. TYRANT

The shadow King becomes the Tyrant—using power to dominate rather than serve. The Tyrant operates from fear and ego. He demands loyalty instead of earning it. He creates order through force rather than inspiration.

Or the King becomes the Weakling—abdicating responsibility, refusing to decide, avoiding the throne. This shadow creates chaos because someone has to lead, and healthy leadership has departed.

The Heart-Centered King holds the balance: firm but kind, strong but gentle, commanding but humble. He knows his power and doesn't abuse it.

WHAT THE KING PROTECTS

A good king creates a realm where others can flourish. In personal terms: his family feels safe, his community trusts him, his environment thrives under his care. He asks not "what can I get?" but "what do those in my care need?"

This is a radical concept in a world of self-interested leadership. The heart-centered king sacrifices his comfort for others' wellbeing. Not from codependency, but from understanding that his fulfillment comes through service.""",

        "somatic_practice": """HEART-CENTERED KING EMBODIMENT (30 minutes)

This practice cultivates benevolent leadership energy.

THE PRACTICE:

1. THRONE POSTURE (5 minutes)
Sit with dignity—spine tall, shoulders back, hands resting.
Feel as if you're sitting on a throne.
Not arrogance—regality. You have earned this seat through responsibility, not entitlement.
Breathe into your solar plexus (power) AND your heart (love). Both must be activated.

2. SURVEYING YOUR REALM (5 minutes)
Close eyes. Consider your "realm"—all that's under your care.
Your body. Your home. Your family or loved ones. Your work. Your community.
See each area. What's thriving? What needs attention?
A good king knows his realm intimately.

3. HEART-CENTERED DECISIONS (10 minutes)
Bring to mind a decision you've been avoiding.
Place hands on heart. Ask: "What is best for all involved?"
Feel the answer arise—not from fear or self-interest, but from heart wisdom.
A king decides. Make the internal commitment.
Notice how it feels to decide from love rather than fear.

4. BLESSING YOUR REALM (7 minutes)
Visualize those in your care standing before you.
One by one, place your hand (energetically) on their head.
Speak blessing: "May you be well. May you flourish. May you know you are loved."
Feel the energy of benevolent blessing flowing through you.

5. KING'S VOW (3 minutes)
Stand tall. Speak aloud:
"I am a heart-centered king.
I lead with love and strength.
I serve those in my care.
I create order that serves flourishing.
My power is used for good."

DAILY PRACTICE:
Each morning, consider: "How can I serve my realm today?" Each night: "Did I lead with heart today?" This builds the king consciousness over time."""
    },

    "lover-embodiment-practice": {
        "deeper_teaching": """The Sacred Lover: Passion, Presence, and Deep Feeling

The Lover archetype is perhaps the most suppressed aspect of healthy masculinity. Men are taught to be warriors, providers, stoics—not feelers. The result is men disconnected from their own hearts, their passion, their capacity for deep intimacy.

WHAT IS THE LOVER?

The Lover is the part of masculine energy that feels deeply, connects intimately, and experiences passion. He is sensual—alive to the pleasures of the senses. He is romantic—capable of love poetry and tender gestures. He is passionate—fully engaged with life, art, beauty, and love.

This isn't "feminine" energy—it's mature masculine energy that hasn't been amputated. Throughout history, the greatest poets, artists, and lovers have been men who had access to this archetype.

THE SUPPRESSION OF FEELING

"Boys don't cry." "Man up." "Don't be sensitive." These messages systematically destroy men's connection to the Lover. By adulthood, many men have forgotten how to feel. They know their thoughts but not their emotions. They can analyze but not empathize.

The cost is enormous: men who can't access intimacy, who use substances to feel something, who rage because they can't cry, who die of heart attacks because their hearts are closed.

RECLAIMING THE LOVER

To reclaim the Lover is not to become "soft" in the negative sense. It's to become fully human. The strongest men are those who can feel deeply AND act powerfully. They can weep AND fight. They can surrender to love AND maintain boundaries.

The Lover allows us to be fully alive. Without him, life is grey, flat, mechanical. With him, the world is vivid with meaning, beauty, and connection.""",

        "somatic_practice": """SACRED LOVER AWAKENING (25 minutes)

This practice reconnects men to feeling, sensuality, and passion.

PREPARATION:
Choose music that moves you emotionally. Have something beautiful nearby—art, a flower, a photograph of someone you love.

THE PRACTICE:

1. PERMISSION TO FEEL (5 minutes)
Sit comfortably. Close eyes.
Speak aloud: "I give myself full permission to feel. All emotions are welcome. I am safe to feel."
Breathe into your heart. Notice whatever emotions are present.
Name them without judgment: "There's sadness. There's longing. There's joy."

2. SENSORY AWAKENING (5 minutes)
Open your eyes. Really look at something beautiful.
Let yourself be moved. If tears come, welcome them.
Touch something with full attention—feel textures.
Listen to sounds with your heart, not just ears.
This is being alive. This is the Lover's domain.

3. HEART EXPANSION (5 minutes)
Play your music. Place hands on heart.
Let the music move you. Let yourself feel the beauty.
If tears come, they are sacred. If joy comes, let it expand.
Men are allowed to be moved. You are allowed.

4. PASSION INVENTORY (5 minutes)
Ask yourself: What do I love? What makes me feel alive?
Not "should," but truly LOVE.
People, activities, art, places—what lights you up?
The Lover knows what he loves and follows it.

5. LOVE EXPRESSION (5 minutes)
Think of someone you love. Feel it fully.
Speak aloud what you would say to them if nothing held you back.
"I love you because..." "You mean to me..."
Let yourself be as tender as you truly are.

INTEGRATION:
The Lover is not for special occasions—he's for everyday. Let yourself feel the beauty in ordinary moments. Tell people you love them. Create. Appreciate. This is living."""
    },

    "sage-wisdom-practice": {
        "deeper_teaching": """The Sage: Wisdom Keeper and Magician of Transformation

The Sage, sometimes called the Magician, is the archetype of wisdom, insight, and transformation. He is the wise elder, the shaman, the mentor who has earned knowledge through experience and uses it to guide others through their own transformations.

THE WISE ELDER

Every culture has had its wise men—the elders who hold knowledge, the teachers who pass it on, the advisors who see clearly what others miss. This archetype lives in every man, waiting to mature.

The Sage has done his own work. He's not giving advice from theory but from lived experience. He's failed and learned. He's suffered and gained wisdom. His guidance comes from the depths, not the surface.

THE MAGICIAN'S POWER

The Magician aspect of this archetype involves transformation—the ability to shift reality through consciousness, ritual, and understanding of hidden laws. This isn't stage magic; it's the genuine power of one who understands how energy works.

The Sage-Magician sees beneath surface appearances to underlying patterns. He knows that changing the inner transforms the outer. He works with symbols, rituals, and energy to facilitate change—in himself and in those he guides.

EARNING WISDOM

Wisdom cannot be bought, inherited, or faked. It can only be earned through life lived consciously. The Sage archetype doesn't activate through reading books, though books may help. It activates through suffering transformed, failures integrated, and triumphs humbled.

The path to Sage involves sitting with not-knowing. The wise man knows how much he doesn't know. This humility creates space for genuine wisdom to enter.""",

        "somatic_practice": """SAGE-MAGICIAN ACTIVATION (30 minutes)

This practice awakens inner wisdom and transformative power.

THE PRACTICE:

1. SAGE'S STILLNESS (7 minutes)
Sit in meditation posture. The Sage values stillness.
Let all thoughts settle. No effort to achieve anything.
Just sitting. Just being. This is the Sage's practice.
In stillness, wisdom has space to arise.

2. LIFE REVIEW (8 minutes)
Reflect on your life's greatest challenges.
How did you suffer? What did you learn?
The Sage extracts wisdom from all experience—especially the hard parts.
Ask: "What have my wounds taught me?"

3. THIRD EYE OPENING (5 minutes)
Focus attention on the space between your brows.
Visualize an eye slowly opening there.
Ask: "What do I need to see clearly?"
Let insight arise. Trust what comes—it's your inner Sage speaking.

4. TRANSFORMATION PRACTICE (5 minutes)
Bring to mind a stuck situation in your life.
Instead of trying to fix it, see it differently.
The Magician transforms through perception shift, not force.
Ask: "How can I see this in a way that opens possibility?"
Let the new perspective emerge.

5. TRANSMISSION (5 minutes)
Place hands on thighs, palms up.
Feel your life wisdom collected in your hands.
Consider: Who needs this wisdom? What can you teach?
The Sage's purpose is to transmit what he's learned.
Commit to sharing your wisdom where it's needed.

INTEGRATION:
The Sage grows through teaching and continued learning. Share what you know. Admit what you don't. Stay humble and curious. Wisdom deepens."""
    },

    "father-energy-practice": {
        "deeper_teaching": """Healing the Father Wound, Becoming the Father

For many men, the relationship with father is the central wound of their masculine psyche. Whether the father was absent, abusive, emotionally unavailable, or simply unable to provide what was needed—this wound shapes how men relate to themselves, to authority, and to their own potential for fatherhood.

THE FATHER WOUND

Sons need blessing from fathers. They need to hear: "I see you. I'm proud of you. You are enough. You have what it takes." When this blessing is absent, the son spends his life unconsciously seeking it from bosses, institutions, and achievements that can never provide it.

The father wound manifests as: chronic self-doubt, difficulty with authority, workaholism to prove worth, inability to feel "enough," struggles with fathering one's own children.

FORGIVENESS AND UNDERSTANDING

Healing begins with understanding that your father was also wounded. His father likely couldn't give what he didn't have. This doesn't excuse harm, but it creates context. The wound is generational—you have the chance to break the cycle.

True forgiveness isn't saying what happened was okay. It's releasing the hold the past has on your present. It's refusing to let his limitations define your potential.

BECOMING THE FATHER YOU NEEDED

The ultimate healing is becoming—for yourself and perhaps for others—the father energy you needed. You can parent your inner child with the love and blessing he deserved. You can be for your actual children (or mentees) what you didn't receive.

This is not about being perfect. It's about being present, blessing freely, and breaking the chain of wounded fathering that may go back generations.""",

        "somatic_practice": """FATHER WOUND HEALING & EMBODIMENT (35 minutes)

This practice may bring up grief. Allow it.

THE PRACTICE:

1. FATHER INVENTORY (7 minutes)
Sit quietly. Consider your father or father figure.
What did you receive that was good?
What did you need but not receive?
Write or speak this honestly. Don't minimize.

2. GRIEF WORK (8 minutes)
Feel the loss—of what you needed and didn't get.
Place hands on heart. Breathe into the ache.
Allow tears if they come. Men are allowed to grieve.
Speak: "I grieve what I didn't receive. I honor this wound."

3. UNDERSTANDING (5 minutes)
Consider your father's life. His childhood, his struggles.
He was once a boy who needed blessing too.
This doesn't excuse harm—it contextualizes it.
Speak: "My father was also wounded. He gave what he could."

4. FORGIVENESS (5 minutes)
Forgiveness is for YOU, not for him.
Speak: "I forgive my father for what he couldn't give. I release this burden. I am free to become the man I'm meant to be."
Feel the weight lift.

5. BECOMING FATHER (7 minutes)
Place your hand on your own head—blessing yourself.
Speak what you needed to hear:
"I am proud of you. You are enough. You have what it takes. I love you unconditionally."
Let yourself receive this blessing.
Feel yourself becoming the father energy—for yourself and others.

6. COMMITMENT (3 minutes)
If you have children: commit to breaking the cycle.
If not: commit to fathering your inner child and mentoring others.
Speak: "The wounded fathering ends with me. I embody healthy father energy."

ONGOING WORK:
This isn't one-time work. Continue the inner blessing practice. Consider therapy if wounds are deep. The father wound heals in community with healthy masculine energy—seek it."""
    },

    "body-honoring-practice": {
        "deeper_teaching": """The Body as Temple: Men's Sacred Embodiment

Men are taught contradictory things about their bodies: be strong but not vain, be physically competent but don't feel too much, use your body as a tool but don't really inhabit it. Many men exist from the neck up, disconnected from the wisdom below.

THE DISSOCIATION

Male embodiment is often performative—the body as achievement machine, as status symbol, as threat display. This is different from true embodiment, which is being at home in the body, feeling the body from within, living as a body rather than having one.

Trauma, sports culture, military training, and "manning up" all contribute to dissociation. Men learn to override body signals: exhaustion, pain, hunger, fear. This "toughness" actually weakens men—disconnecting them from essential information and from the ground of their being.

THE BODY'S WISDOM

The body knows before the mind. Gut feelings, heart intelligence, and physical intuition guide us when we listen. Men who are disconnected from their bodies miss this guidance, making decisions only from the head—which is vastly limited.

The body also holds emotion. When men can't feel their bodies, they can't feel their feelings. They're numb below the neck—and then wonder why they struggle with intimacy, why they explode in rage, why they feel dead inside.

RECLAIMING EMBODIMENT

True masculine embodiment is both strong AND sensitive. The warrior who feels the earth beneath him, the lover who feels pleasure and tenderness, the king who senses his realm, the sage who feels energy and intuition—all require embodiment.

To reclaim the body is to reclaim wholeness. You are not a brain piloting a meat vehicle. You are an embodied soul, and the body is sacred ground.""",

        "somatic_practice": """MASCULINE BODY HONORING (25 minutes)

This practice restores men to full embodiment.

THE PRACTICE:

1. ARRIVING IN THE BODY (5 minutes)
Stand barefoot. Feel your feet, your legs, your weight on the ground.
Move attention slowly upward: legs, pelvis, belly, chest, arms, head.
Speak: "I am here. I am in my body. This body is my home."

2. BREATH OF PRESENCE (5 minutes)
Breathe deeply into your belly—really fill it.
Most men breathe shallowly in the chest. Drop deeper.
Feel your breath massaging internal organs.
This is being alive, from inside.

3. SENSATION INVENTORY (5 minutes)
Scan your body slowly. What do you feel?
Tightness? Warmth? Numbness? Aliveness?
Don't judge or fix—just notice.
Many men have never simply felt their own bodies.

4. HONORING TOUCH (5 minutes)
Place hands on different body parts and speak appreciation:
"I honor these legs that carry me."
"I honor this chest that holds my heart."
"I honor these arms that embrace and create."
"I honor this body for everything it's done for me."
This isn't vanity—it's gratitude and presence.

5. COMMITMENT TO BODY (5 minutes)
Speak: "I commit to honoring this body. I will listen when you speak. I will rest when you need rest. I will move with you, not against you. We are partners, body and soul."

DAILY PRACTICE:
Check in with your body several times daily: "Body, how are you?" Learn its language. Feed it well, move it often, let it rest. This is masculine embodiment."""
    },

    "sacred-masculine-sexuality": {
        "deeper_teaching": """Sacred Masculine Sexuality: Beyond Performance

Male sexuality has been both shamed and distorted. Shamed as "base" and "animalistic." Distorted through pornography, conquest mentality, and performance anxiety. The result: men disconnected from the profound spiritual power of their own sexual energy.

BEYOND SHAME AND DISTORTION

Your sexuality is not sinful. It is creative life force—the same energy that drives evolution, that inspires art, that fuels achievement. When this energy is shamed, it goes underground and emerges distorted. When it's channeled consciously, it becomes power.

Equally, sexuality is not conquest. Partner-as-object, "score" mentality, performance anxiety—these miss the point entirely. Sacred sexuality is relational, connected, present. It's not about what you get but about what you give and share.

SEXUAL ENERGY AS LIFE FORCE

The ancients knew: sexual energy is creative energy is spiritual energy. Tantra, Taoist sexual practices, and Western esoteric traditions all teach that this force can be cultivated, circulated, and transmuted.

Most men dissipate this energy unconsciously—through frequent ejaculation, pornography, and unconscious sexual fantasy. There's nothing wrong with sexual expression, but unconscious leaking leaves men depleted. Conscious cultivation builds vitality, creativity, and presence.

THE PATH OF THE SACRED MASCULINE LOVER

The sacred masculine lover is: Present—fully there with his partner, not in fantasy. Connected—heart open, energy flowing between both. In service—focused on mutual pleasure and spiritual connection. Patient—not racing toward orgasm but savoring the journey. Powerful—unashamed of his desire, unapologetic about his passion.

This is a practice that transforms not just sex but all of life. When sexual energy is conscious, everything is more vital.""",

        "somatic_practice": """SACRED MASCULINE SEXUALITY PRACTICE (25 minutes, solo)

This practice cultivates conscious relationship with sexual energy.

THE PRACTICE:

1. HONORING LIFE FORCE (5 minutes)
Sit comfortably. Breathe into your pelvis.
Acknowledge: "My sexual energy is sacred. It is creative life force. I honor it."
Feel the energy in your genital area without stimulating it.
This is the root of your power.

2. ENERGY CIRCULATION (7 minutes)
Using breath and intention, begin to move the energy upward.
Inhale: draw energy from pelvis up the spine.
Exhale: let it flow down the front of your body back to pelvis.
Create a loop—the microcosmic orbit.
This circulates rather than dissipates sexual energy.

3. HEART-GENITAL CONNECTION (5 minutes)
Visualize an energy line between your heart and your genitals.
These two centers often get disconnected in men.
Breathe and feel them linked: love and desire united.
Speak: "I unite my heart and my passion."

4. PRESENCE PRACTICE (5 minutes)
Imagine a sexual connection with a partner (real or imagined).
But instead of fantasy, practice PRESENCE.
Feel your body. Feel energy. Feel heart.
This is how the sacred lover shows up—fully present.

5. DEDICATION (3 minutes)
Speak: "I dedicate my sexual energy to love, consciousness, and sacred connection. I release shame. I release conquest mentality. I embrace my sexuality as spiritual power."

INTEGRATION:
Consider how you currently relate to your sexuality. Does it need more consciousness, more presence, more heart? These practices transform sexuality over time—be patient and consistent."""
    },

    "wild-man-awakening": {
        "deeper_teaching": """The Wild Man: Reclaiming Untamed Masculine Nature

Deep in every man lives the Wild Man—untamed, connected to nature, instinctual, and free. He is the part that howls at the moon, runs through forests, speaks truth without apology. In our over-civilized world, he has been caged.

WHO IS THE WILD MAN?

Robert Bly's "Iron John" revived this archetype: the Wild Man is not savage or destructive—he's natural. He's the part of men that knows the wilderness, that feels kinship with animals, that isn't domesticated by social convention.

The Wild Man is: spontaneous, present, instinctual, embodied, unapologetic, connected to Earth. He doesn't ask permission to exist. He doesn't shrink to fit. He takes up his space fully.

THE OVER-CIVILIZED MAN

Modern men are often over-civilized: too much head, not enough heart and gut. Too much screen, not enough forest. Too much pleasing others, not enough wild self-expression.

This creates men who are: anxious, depressed, disconnected, numb, rage-filled (because wildness must go somewhere), addicted (seeking artificial intensity). The cage is killing them.

FREEING THE WILD

The Wild Man needs: time in nature, physical exertion, primal expression, community with other men, and permission to be untamed. He needs to run, sweat, shout, drum, and feel his animal body.

This isn't regression—it's balance. A man needs both Wild Man and civilized consciousness. The goal is integration: a man who can attend board meetings AND howl at the moon, who respects social contracts AND honors his instincts.""",

        "somatic_practice": """WILD MAN AWAKENING RITUAL (30 minutes)

Do this outdoors if possible. Be ready to make noise and move.

THE RITUAL:

1. FINDING HIM (5 minutes)
Stand with feet grounded.
Breathe deep into your belly—primal breath.
Call to the Wild Man within: "I am ready to meet you. Come forth."
Feel where he stirs. He's been waiting.

2. WILD MOVEMENT (10 minutes)
Begin to move in ways that aren't polished or "correct."
Stomp. Prowl. Crouch. Shake.
Move like an animal. Let your body remember its wild nature.
No choreography. No grace required. Raw, primal movement.

3. WILD VOICE (5 minutes)
Make sounds. Deep, guttural, wild sounds.
Growl from your belly. Roar from your chest. Howl.
Let out what's been suppressed.
This might feel ridiculous. Do it anyway. The Wild Man doesn't care how it looks.

4. WILD STILLNESS (5 minutes)
Come to stillness. Stay connected to wildness even in stillness.
Listen with animal ears. Smell the air. Feel the ground.
This is primal presence. Alert. Alive.
The Wild Man is also quiet—listening, sensing, knowing.

5. INTEGRATION (5 minutes)
Thank the Wild Man for showing himself.
Commit: "I will make space for you. I will not cage you completely. We walk together."
Feel him integrated—not taking over, but present.

ONGOING PRACTICE:
The Wild Man needs regular expression: time in nature, physical challenge, primal sound and movement, time with men who honor wildness. Feed him or he'll wither—or erupt destructively."""
    },

    "tender-warrior-practice": {
        "deeper_teaching": """The Tender Warrior: Strength in Service of Love

The Tender Warrior archetype is the integration of two qualities that culture tells men can't coexist: fierceness and tenderness. But the most powerful men are those who can be both—strong enough to protect, soft enough to feel.

THE FALSE DICHOTOMY

Society tells men: be tough OR be tender. You can be a warrior OR be loving. Real men don't cry. Sensitive men aren't strong. This dichotomy cripples men.

The result: men who are all armor (unable to connect, emotionally unavailable, secretly lonely) OR men who've rejected strength entirely (unable to set boundaries, unable to protect, ungrounded).

THE INTEGRATION

The Tender Warrior knows: true strength enables tenderness. A man who is unafraid can be gentle. A man who can protect can be vulnerable. Strength and tenderness arise from the same source—a heart that is both open AND powerful.

Jesus turning over tables in the temple. The Samurai's compassion alongside his sword skill. The father who can fight for his family AND cry with them. This is the Tender Warrior.

THE PATH

Becoming a Tender Warrior requires developing both poles. Practice strength: physical training, boundary setting, the courage to fight when needed. Practice tenderness: emotional vulnerability, gentle touch, allowing tears.

Neither pole is complete without the other. The Warrior without tenderness becomes a brute. Tenderness without warrior strength becomes enabling and unprotected. Together, they make a whole man.""",

        "somatic_practice": """TENDER WARRIOR EMBODIMENT (25 minutes)

This practice develops both poles and their integration.

THE PRACTICE:

1. WARRIOR ACTIVATION (7 minutes)
Stand in warrior stance: feet wide, knees bent, arms strong.
Feel power in your legs, core, arms.
Breathe fire breath: rapid belly pumps.
Make a strong sound: "HA!" from your center.
Feel the warrior energy—ready, powerful, protective.

2. TENDER SOFTENING (7 minutes)
Now soften completely. Sit or lie down.
Let all tension release. Let your face soften.
Place hands on heart. Breathe gently.
Feel your vulnerability. This is also you.
Allow any emotion present. This is the tender man.

3. INTEGRATION (6 minutes)
Stand again, but now hold both.
Warrior legs—grounded, strong.
Tender heart—open, feeling.
Fierce eyes—alert, protective.
Soft face—capable of compassion.
This is the Tender Warrior: strong AND soft, fierce AND gentle.

4. DEDICATION (5 minutes)
Speak: "I am strong enough to be tender. I am tender enough to be truly strong.
My strength protects what I love.
My tenderness allows me to truly connect.
I am the Tender Warrior. Both poles live in me."

DAILY PRACTICE:
Notice when you default to all-armor or all-soft. Neither is complete. Practice the other pole. In conflict, add tenderness. In tenderness, don't lose your ground. This is the path."""
    },

    "brotherhood-circle-practice": {
        "deeper_teaching": """The Power of Brotherhood: Men in Circle

Modern men are deeply isolated. They may have drinking buddies but no one they truly confide in. They may have business associates but no brothers. This isolation is deadly—literally. Men die younger, suffer more from depression, and commit suicide at far higher rates than women, partly because they lack the support that comes from genuine brotherhood.

WHY MEN NEED MEN

Men need other men for specific things that women cannot provide:
- Being witnessed and accepted by those who understand male experience
- Challenging and being challenged in ways that promote growth
- Healthy competition that builds rather than destroys
- Initiation into mature masculinity by those who've walked the path
- Safe space to feel without being "fixed" or worried over

There are some wounds that only male presence can heal. A man's masculinity, ultimately, can only be fully blessed by other men.

THE CIRCLE STRUCTURE

When men gather in circle, something powerful happens. The circle shape indicates equality—no one is above another. With simple agreements (confidentiality, presence, honoring each voice), men create what most desperately need: a space to be real.

Men in circle can: share their struggles without shame, express emotion without judgment, speak their truth and be heard, offer and receive challenge and support. This is ancient—tribal men always had their circles—and we've lost it.

CREATING BROTHERHOOD

Men's circles, men's groups, and male friendships that go below the surface are essential for male wellbeing. If you don't have this, create it. Invite one or two men to go deeper. Form a group. Find existing circles.

The lone wolf is a dying wolf. Men need brothers.""",

        "somatic_practice": """BROTHERHOOD CIRCLE STRUCTURE (For a group of men)

Use this template to create men's circle.

GATHERING:

1. OPENING (10 minutes)
Light a candle. Sit in circle—on the ground if possible.
One man opens: "We gather as brothers. What's shared here stays here. We listen without fixing. We speak our truth."
Each man states his name and sets an intention.

2. CHECK-IN ROUND (15-30 minutes)
Using a talking piece (stone, stick), go around.
Each man briefly shares: How are you really? What's alive in you?
Others listen in full presence. No advice.
After each share: "We hear you. We see you."

3. DEEPER SHARING (time varies)
One or more men take more time to share something significant.
This is the heart of circle—men being real with men.
Listeners can reflect back what they heard.
Ask permission before offering perspective.

4. CHALLENGE/SUPPORT ROUND (optional)
Men can request challenge: "Where am I fooling myself?"
Or request support: "What encouragement do you have?"
This is brotherly accountability.

5. CLOSING (10 minutes)
Offers of gratitude for specific shares.
Final round: one word or phrase for how you're leaving.
Closing words: "What's shared here stays here. Until we meet again, we carry each other in our hearts."
Blow out candle together.

ONGOING BROTHERHOOD:
Regular gathering builds trust. Monthly, bi-weekly, or weekly. Consistency matters. Over time, these men become true brothers—a rare and precious thing."""
    },

    "elder-within-practice": {
        "deeper_teaching": """Seeking the Elder: The Inner Wise Old Man

As men age, they have the opportunity to become Elders—those who hold wisdom for the community, who guide the young, who bless the generations. But age alone doesn't make an Elder. Many old men are simply old—not wise, not generative, not blessing-givers.

WHAT IS AN ELDER?

The Elder archetype carries: accumulated wisdom from a life consciously lived, perspective that can see the long view, compassion born from understanding human struggle, authority earned through integrity, generosity—the desire to give back rather than accumulate.

The Elder is the final stage of mature masculine development. If Warrior serves the present, King orders the present, and Sage understands the patterns, the Elder blesses and transmits wisdom to the future.

THE ELDER CRISIS

Modern culture has no place for Elders. Old people are dismissed, warehoused, or mocked. The natural flow of wisdom from elder to youth has been severed. Young men desperately need Elder blessing and guidance; old men desperately need to give it. Both suffer in the disconnection.

This creates: young men without direction or blessing, old men without purpose or meaning. Both generations suffer.

BECOMING AN ELDER (AT ANY AGE)

You don't have to be chronologically old to develop Elder consciousness. You can begin cultivating it now: reflecting on your life for wisdom, considering what you want to transmit, finding ways to mentor and bless younger people.

And regardless of age, you can seek the Elder Within—the inner wise old man who has always been there, carrying the accumulated wisdom of the human journey. He waits to be consulted.""",

        "somatic_practice": """ELDER WITHIN MEDITATION (25 minutes)

This practice connects you with inner Elder wisdom.

THE PRACTICE:

1. BECOMING OLD (5 minutes)
Close your eyes. Breathe deeply.
Imagine yourself at the end of a very long, full life.
Feel yourself in an old body—tired but peaceful.
You have lived well. You have wisdom.
What does this future Elder know that you need to hear now?

2. MEETING THE INNER ELDER (10 minutes)
In your imagination, see an old man—your inner Elder.
He might look like an idealized older version of yourself, or like a wise figure from story or history.
Approach him with respect. He carries wisdom.
Ask: "What do I need to know right now?"
Listen to his answer. He speaks from beyond your current perspective.

3. RECEIVING BLESSING (5 minutes)
Ask the Elder to bless you.
Feel his hand on your head.
Receive words you need to hear—about your worth, your path, your future.
This is the blessing men need and rarely receive.
Let it in.

4. COMMITMENT TO ELDER DEVELOPMENT (5 minutes)
Thank the inner Elder.
Ask: "How can I develop Elder qualities now?"
Listen.
Commit to what you hear: mentoring, reflection, wisdom-seeking, blessing others.
Speak: "I commit to becoming a blessing-giving Elder."

ONGOING PRACTICE:
Consult the inner Elder when facing decisions or confusion. He has perspective you lack. Seek out living Elders who embody wisdom. And begin now to bless the young—even if you're young yourself. Elder consciousness is cultivated, not merely acquired by aging."""
    },

    "wild-nature-immersion": {
        "deeper_teaching": """Wild Nature: The Masculine Return to Earth

Men need wilderness. Not manicured parks—actual wild nature. Something in the male psyche responds to mountains, forests, rivers, and open sky. This isn't nostalgia; it's biological and spiritual truth.

THE CALL OF THE WILD

Throughout evolutionary history, men's work took them into wild nature—hunting, exploring, protecting the perimeter. The male nervous system is designed for this: alert to danger, responsive to natural rhythms, alive in ways that offices and cities cannot activate.

Modern men are nature-deprived. Surrounded by artificial light, artificial surfaces, artificial everything—they've lost connection to the ground of being. Depression, anxiety, attention problems, and existential emptiness often have a simple, partial remedy: go outside.

WHAT NATURE PROVIDES

Wild nature offers men: perspective (problems shrink against mountains), presence (nature demands attention), solitude (rare and necessary), challenge (the elements don't negotiate), beauty (feeding the soul), and connection to something larger than human concerns.

In nature, the mask can drop. There's no one to perform for. The Wild Man can emerge. Emotions held in the body can release. Clarity comes that's impossible in the buzz of civilization.

THE PRACTICE OF IMMERSION

This isn't about occasional vacations. It's about regular immersion—ideally weekly contact with wild or semi-wild nature. Hiking, camping, kayaking, fishing, sitting by streams, walking in forests—all count.

For deepest effect: go alone sometimes. Stay overnight if possible. Remove devices. Let the wild work on you. You'll return different—more yourself.""",

        "somatic_practice": """WILD NATURE IMMERSION PRACTICE

This is best done outdoors. Adapt if necessary.

THE PRACTICE:

1. ARRIVAL (5 minutes)
Find a natural setting—forest, park, anywhere with trees and earth.
Stand or sit. Feel the ground. Breathe the air.
Announce your presence: "I am here. I come in respect. I need what nature offers."
Ask permission to be here.

2. SENSORY OPENING (10 minutes)
Open all senses to the wild:
- See: really look at trees, sky, textures, light
- Hear: layers of sound, near and far
- Smell: earth, plants, rain, decay and growth
- Touch: bark, soil, leaves, water if available
- Taste: clean air
This is full presence—animal awareness.

3. WALKING MEDITATION (15 minutes)
Walk slowly, in silence.
Feel each step—foot meeting earth.
Let go of destination. Just walk.
Notice what draws your attention.
If thoughts intrude, return to sensation: feet, breath, seeing.

4. SIT SPOT (20+ minutes if possible)
Find a place to sit.
Sit for at least 20 minutes. An hour is better.
Do nothing. Just be present.
Let nature work on you. Notice what shifts internally.
This is ancient medicine. Trust it.

5. OFFERING (5 minutes)
Before leaving, offer something: a strand of hair, a song, words of gratitude.
Native people always gave back to the land.
Say: "Thank you for having me. I will return."
Take the wild presence back into your life.

REGULAR PRACTICE:
Make wild nature a non-negotiable part of your schedule. Weekly is ideal. The cumulative effect is profound. You will become more grounded, more present, more sane."""
    }
}


async def update_masculine() -> None:
    """Add deeper teachings to all masculine embodiment practices."""
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    for practice_id, teachings in MASCULINE_DEEPER_TEACHINGS.items():
        teachings["updated_at"] = timestamp
        
        result = await db.masculine_embodiment.update_one(
            {"id": practice_id},
            {"$set": teachings}
        )
        
        if result.modified_count:
            print(f"✅ Deepened: {practice_id}")
        else:
            print(f"⚠️  Not found or unchanged: {practice_id}")
    
    client.close()
    print("\n✨ Masculine embodiment deepening complete!")


if __name__ == "__main__":
    asyncio.run(update_masculine())
