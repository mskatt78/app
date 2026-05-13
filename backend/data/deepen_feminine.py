"""
Script to add deeper teachings to all Feminine Embodiment practices.
Run with: cd /app/backend && python3 -c "import asyncio; from data.deepen_feminine import update_feminine; asyncio.run(update_feminine())"
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

FEMININE_DEEPER_TEACHINGS = {
    "sacred-sensuality-practice": {
        "deeper_teaching": """The Sacred Art of Sensuality: Reclaiming the Body as Temple

Sensuality is not sexuality, though they are related. Sensuality is the art of being fully present in the senses—fully alive in the body. For millennia, particularly in cultures shaped by religious shame, sensuality was demonized. Women were taught that to enjoy their bodies was sinful, that pleasure was the gateway to corruption. This teaching wounded the feminine soul.

THE ORIGINAL INNOCENCE OF PLEASURE

In the beginning, there was no shame in the body. The divine feminine energy that creates all life expresses through pleasure—the pleasure of breathing, eating, touching, moving, making love. Pleasure is not sinful; it is sacred feedback saying "yes, this is life, this is good."

When we reclaim sensuality, we reclaim our birthright to feel. We heal the ancient wound that said the body was inferior to spirit. In truth, the body IS spirit in form. There is no separation.

THE FIVE GATEWAYS OF SACRED SENSE

Each sense is a portal to presence:
- SIGHT: When we truly see—a flower, a loved one's face, beauty anywhere—we touch the divine through the eyes.
- SOUND: Sacred music, nature's symphony, a beloved voice—hearing fully is a form of prayer.
- SMELL: Roses, incense, the earth after rain—the nose connects us to memories, emotions, and subtle realms.
- TASTE: Eating consciously, savoring each bite, is a communion with the life force in food.
- TOUCH: The skin is our largest organ. Through touch, we know ourselves and connect with others.

These senses, when fully engaged, pull us out of mental abstraction and into embodied presence. This IS spiritual practice.

HEALING SENSUAL SHAME

Many carry deep shame around sensuality. Perhaps you were told your enjoyment of your body was wrong. Perhaps your sensuality was exploited or violated. Perhaps you learned to disconnect from the body to survive.

Healing comes through gentle re-connection. We learn that we can feel without being overwhelmed. We discover that pleasure doesn't make us vulnerable to exploitation—disconnection does. We find that honoring our sensual nature actually makes us SAFER, because we're present in our bodies and aware of our boundaries.

THE SENSUAL AS SACRED PATH

In tantric traditions, the senses are not obstacles to enlightenment but vehicles for it. By fully entering the experience of sensation, we dissolve the boundary between self and other, inner and outer. The sensory moment becomes timeless. Eating a strawberry with full presence can be as enlightening as hours of meditation.

This is why the sacred feminine has always known that the body is the temple. The temple isn't a building you go to—it's the flesh you inhabit.""",
        
        "somatic_practice": """SENSUALITY AWAKENING PRACTICE (30 minutes)

This practice re-awakens the five senses as sacred gateways to presence.

PREPARATION:
Gather: Something beautiful to look at (flower, artwork, candle), something fragrant (essential oil, fresh herb), something delicious to taste (fruit, chocolate), something with interesting texture, and beautiful music.

THE PRACTICE:

1. SACRED SPACE (3 minutes)
Light a candle. Set intention: "I reclaim my body as sacred. I honor my senses as gateways to the divine."

2. SIGHT AWAKENING (5 minutes)
Gaze at something beautiful. Don't analyze—just see.
Notice colors, textures, the play of light.
Let beauty enter you through the eyes.
Whisper: "I see the sacred everywhere."

3. SOUND AWAKENING (5 minutes)
Put on music that moves you.
Close your eyes. Let sound enter your body.
Feel how music moves your emotions, your energy.
Whisper: "I hear the voice of the divine."

4. SMELL AWAKENING (4 minutes)
Inhale a scent that delights you.
Notice how smell connects to memory, emotion.
Let fragrance fill your entire being.
Whisper: "I breathe in the essence of life."

5. TASTE AWAKENING (5 minutes)
Take something delicious. Eat it with excruciating slowness.
Notice every texture, temperature, flavor.
Let eating be communion.
Whisper: "I taste the sweetness of existence."

6. TOUCH AWAKENING (5 minutes)
Run your hands over your own body with appreciation.
Touch different textures—soft fabric, cool metal.
Feel how your skin receives the world.
Whisper: "My body is sacred. Touch is prayer."

7. INTEGRATION (3 minutes)
Sit with all senses open.
Feel how alive you are right now.
Place hands on heart: "I am sensually awake. I am sacred."

DAILY PRACTICE:
Bring this quality of sensory presence to everyday activities. Eat one meal per day in full sensory awareness. Touch your body with appreciation when bathing. Let the world enter through awakened senses."""
    },

    "moon-cycle-attunement": {
        "deeper_teaching": """Dancing with the Moon: Ancient Feminine Wisdom

For hundreds of thousands of years, women tracked time by the moon. The 29.5-day lunar cycle mirrors the average menstrual cycle, creating a profound connection between women's bodies and celestial rhythms. This wasn't coincidence—it was attunement. Even those who don't menstruate carry this lunar coding.

THE FOUR PHASES AS ARCHETYPES

MAIDEN/WAXING (Day 7-14 of moon cycle):
As the moon grows from new to full, energy expands. This is a time for new beginnings, taking action, and moving toward goals. You may feel more extroverted, confident, and social. Physically, if menstruating, this correlates with the follicular phase—rising estrogen, increasing energy.

MOTHER/FULL (Day 14-21):
The full moon represents peak feminine power—full, radiant, magnetic. This is a time for celebration, completion, and sharing your light. Energy is at its highest. You may feel more sensual, creative, and alive. This corresponds to ovulation—peak fertility, peak radiance.

ENCHANTRESS/WANING (Day 21-28):
As the moon decreases, we naturally turn inward. This is a time for editing, releasing, and letting go of what no longer serves. Energy begins to drop. Emotions may intensify. This corresponds to the luteal phase—progesterone rises, inviting introspection.

CRONE/DARK MOON (Day 1-7):
The dark moon is a time of deep rest, visioning, and connection to the unconscious. In menstruating people, this is often menstruation itself—a time traditionally honored as a retreat from ordinary activities, a descent into the underworld. Here we shed not just blood but everything that needs releasing.

THE SEVERED CONNECTION

Modern life, with its artificial lighting and constant activity, severed our connection to lunar rhythms. We're expected to be equally productive at all times. This is not aligned with feminine nature. No wonder so many women feel exhausted, depressed, or out of sync—we're fighting our own biology.

RESTORING THE RHYTHM

Tracking the moon is a revolutionary act of feminine self-care. Start noticing: How do you feel at each moon phase? If you menstruate, how does your cycle relate to the moon? Many find that living by lunar rhythms naturally regulates their cycles, reduces PMS, and increases vitality.

You don't have to menstruate to be lunar. Every human has a moon within—the receptive, cyclical, rhythmic aspect of being. Honor it.""",

        "somatic_practice": """MOON PHASE BODY PRACTICE

Adapt this practice based on the current lunar phase:

NEW MOON BODY PRACTICE (10 minutes):
Curl into a fetal position. You are in the womb of the dark moon.
Breathe slowly and deeply. Set intentions for the new cycle.
Practice: Stillness. Rest. No effort.
Mantra: "In darkness, I plant seeds."

WAXING MOON BODY PRACTICE (15 minutes):
Stand tall. Begin gentle stretching, reaching upward.
Feel energy building in your body.
Practice: Slow dance, growing more expansive.
Mantra: "I grow toward the light."

FULL MOON BODY PRACTICE (20 minutes):
Full embodiment! Dance, shake, move expressively.
Feel your power at its peak.
Practice: Ecstatic movement under moonlight if possible.
Mantra: "I am radiant. I am full."

WANING MOON BODY PRACTICE (15 minutes):
Begin standing, gradually descend to floor.
Movement becomes slower, more internal.
Practice: Restorative yoga, gentle releases.
Mantra: "I release what no longer serves."

DARK MOON BODY PRACTICE (10 minutes):
Lie flat. Become completely still.
Let yourself dissolve into the dark.
Practice: Savasana with womb awareness.
Mantra: "I surrender to the void."

DAILY MOON CHECK-IN:
Each morning, notice the moon phase (use an app if needed).
Ask your body: "How do I feel in relation to this moon?"
Let your day's activities align with lunar energy when possible."""
    },

    "goddess-embodiment-practice": {
        "deeper_teaching": """The Goddess Lives in You: Archetypal Embodiment

The goddesses of mythology are not merely stories—they are archetypal patterns of feminine power that exist in the collective unconscious and in every woman's psyche. When we "embody" a goddess, we're not pretending to be something we're not. We're awakening a pattern of power that already lives within us.

THE LIVING ARCHETYPES

APHRODITE (Venus): The goddess of love, beauty, and pleasure. Her energy is sensual, magnetic, and creative. When you feel beautiful, desirable, and alive in your body—that's Aphrodite. When you create art, make love, or find pleasure—that's her.

ISIS: Egyptian goddess of magic, motherhood, and resurrection. Her energy is powerful, magical, and healing. When you put broken things back together, heal the wounded, or perform everyday magic—that's Isis.

KALI: Hindu goddess of destruction and transformation. Her energy is fierce, wild, and uncompromising. When you say no, destroy what must die, or tap into righteous rage—that's Kali.

QUAN YIN: Goddess of compassion and mercy. Her energy is gentle, loving, and forgiving. When you show kindness to yourself or others, when you forgive the unforgivable—that's Quan Yin.

ARTEMIS (Diana): Goddess of the hunt, wilderness, and independence. Her energy is free, wild, and self-sufficient. When you need no one's permission, love nature, or protect what's vulnerable—that's Artemis.

PERSEPHONE: Queen of the underworld and goddess of spring. Her energy is transformative, moving between worlds. When you descend into your own darkness and return with wisdom—that's Persephone.

WHY THIS MATTERS

In a world that has demonized and diminished feminine power, many women have lost connection to their goddess nature. We shrink, apologize, and play small. Goddess embodiment is about remembering the full spectrum of feminine power available to us.

You don't worship the goddess outside you—you recognize her within.""",

        "somatic_practice": """GODDESS EMBODIMENT RITUAL (40 minutes)

PREPARATION:
Choose a goddess who calls to you today. Create a simple altar with a candle and image or symbol of her. Wear something that evokes her energy.

THE RITUAL:

1. ALTAR DEDICATION (5 minutes)
Light the candle. Say: "[Goddess name], I invite your presence. I call your energy into my body. Awaken within me."

2. GODDESS BREATH (5 minutes)
Breathe in the qualities of your chosen goddess.
If Aphrodite: breathe in beauty, sensuality, love.
If Kali: breathe in power, destruction, transformation.
If Quan Yin: breathe in compassion, mercy, peace.
Feel these qualities filling your body.

3. GODDESS MOVEMENT (15 minutes)
Put on music that evokes your goddess.
Begin to move as she would move.
Aphrodite: sensual, flowing, magnetic
Isis: powerful, magical, ancient
Kali: fierce, wild, untamed
Quan Yin: gentle, graceful, peaceful
Let her move your body. You are not performing—you are embodying.

4. GODDESS VOICE (5 minutes)
What would your goddess say?
Speak aloud in her voice. Let her wisdom come through.
You might be surprised what emerges.

5. GODDESS MESSAGE (5 minutes)
Sit before your altar.
Ask: "What do you want me to know? What gift do you have for me?"
Listen. Receive. Trust what comes.

6. INTEGRATION (5 minutes)
Thank the goddess. Feel her energy integrating into your cells.
Blow out the candle. The flame is now within you.
Say: "I am [Goddess name]. Her power lives in me."

CARRYING IT FORWARD:
Throughout your day, remember: you have this goddess within. When you need her qualities, invoke her. She is no longer outside you—she IS you."""
    },

    "rose-lineage-meditation": {
        "deeper_teaching": """The Rose Lineage: Ancient Mysteries of the Sacred Feminine

The rose has been the symbol of the sacred feminine mysteries for millennia. From the temples of ancient Egypt where Isis was associated with the rose, to the hidden knowledge carried by Mary Magdalene, to the secret rose gardens of Persian mystics, the rose encodes profound spiritual truths.

THE ROSE AS SPIRITUAL SYMBOL

The rose blooms from bud to flower in a spiral pattern—the same spiral of galaxies, DNA, and spiritual evolution. Its petals form a perfect mathematical sequence. Its fragrance opens the heart chakra. Its thorns remind us that the path of love requires courage. Every aspect of the rose teaches.

In the Christian mystical tradition, the rose window of Gothic cathedrals represented divine light entering the human realm. The five-petaled rose was sacred to Venus and Aphrodite. The red rose represents passionate love, the white rose purity, the pink rose the union of both.

MARY MAGDALENE AND THE ROSE

Mary Magdalene, far from the "repentant prostitute" of medieval church propaganda, was a spiritual master and likely the closest disciple of Jesus. The Gnostic gospels reveal her as a teacher of profound wisdom. She has been called "the Apostle to the Apostles."

The lineage of the Rose that flows through Mary Magdalene carries teachings of sacred union—the hieros gamos, the divine marriage of masculine and feminine, heaven and earth, spirit and matter. These were dangerous teachings in a world that split spirit from body, God from Goddess.

Those who carry the Rose lineage today hold codes for the return of the sacred feminine to Earth. These aren't just metaphors—they're actual frequencies of consciousness that can be received and transmitted.

THE ROSE IN YOUR HEART

When you meditate on the rose, you're not just visualizing a flower. You're connecting to an ancient stream of feminine wisdom that has been carried through priestesses, mystics, and everyday women for thousands of years.

The rose blooms in your heart chakra. You are part of this lineage. You carry these codes. The rose is remembering through you.""",

        "somatic_practice": """ROSE LINEAGE TRANSMISSION (25 minutes)

PREPARATION:
If possible, have a fresh rose. Otherwise, rose essential oil or rose water. Sit before a candle. This is sacred work.

THE TRANSMISSION:

1. ROSE BREATH (5 minutes)
Hold the rose or inhale rose scent.
Let the fragrance enter your heart with each breath.
Feel your heart softening, opening.
The rose is key; it opens what was closed.

2. ROSE VISUALIZATION (5 minutes)
Close your eyes. Visualize a rose bud in your heart center.
With each breath, watch one petal unfold.
The rose slowly, slowly opens—as you open.
See the rose become full, radiant, alive.
Feel its fragrance filling your chest.

3. LINEAGE CONNECTION (5 minutes)
Feel the presence of Mary Magdalene, Isis, and all rose priestesses through time.
You are not alone. You are part of an unbroken lineage.
Feel them surrounding you with love.
Receive their blessing. They have waited for you to remember.

4. CODE DOWNLOAD (5 minutes)
In the center of your heart-rose is a light.
This light contains codes—frequencies of sacred feminine wisdom.
You don't need to understand them intellectually.
Simply receive. Let the light enter your cells, your DNA.
You are being activated.

5. DEDICATION (5 minutes)
Place your hands on your heart.
Speak: "I am a keeper of the Rose. I remember the sacred feminine. I carry these codes for the healing of the world. I am part of the lineage. The Rose blooms through me."
Bow to the rose. Bow to the lineage. Bow to yourself.

DAILY ROSE PRACTICE:
Each day, place your hands on your heart and feel the rose blooming there. Say: "I remember." The more you do this, the more the codes activate."""
    },

    "sacred-body-blessing": {
        "deeper_teaching": """Blessing Your Body: The Radical Act of Self-Love

In a world that profits from women's body hatred, blessing your own body is a revolutionary act. Every day, billions of dollars are made by convincing women their bodies are wrong—too fat, too thin, too old, too flawed. This is a cultural wound of massive proportions.

THE BODY AS SACRED VESSEL

Your body is not a mistake. It is not a problem to be fixed. It is not inferior to your soul. Your body is the sacred vessel that allows consciousness to experience this realm. Without your body, you could not taste strawberries, smell roses, make love, create art, or hug those you cherish.

The ancient goddess traditions knew the body was sacred. Temples were built in the shape of the goddess body. The earth itself was seen as her body. Flesh was not fallen—it was divine matter.

HEALING BODY SHAME

Most women carry deep body shame—internalized messages that their bodies are wrong, shameful, or unlovable. This shame was planted by family, culture, religion, and media. It is not yours. It was given to you, and you can give it back.

Healing begins with awareness: noticing when you criticize your body, when you apologize for taking up space, when you hide or compare. Then comes the radical choice to bless instead of curse.

THE BLESSING PRACTICE

To bless is to speak good over something. When you bless your body, you counteract the countless curses you've received. You speak the truth over your flesh: you are sacred, you are worthy, you are enough.

This isn't affirmation to cover up real feelings. It's a practice of truth-telling. The truth is: your body is a miracle. Every cell works in concert to keep you alive. Your heart beats without your effort. You breathe without thinking. You are a walking miracle, and blessing is simply telling the truth.""",

        "somatic_practice": """SACRED BODY BLESSING RITUAL (25 minutes)

This practice can bring up emotion. Allow whatever arises.

PREPARATION:
Stand naked before a full-length mirror (if privacy permits) or in comfortable clothing. Light a candle. Have oil for anointing if desired.

THE BLESSING:

1. WITNESS (5 minutes)
Stand before the mirror. Simply look at your body.
Notice the impulse to criticize. Don't follow it.
Simply witness. This is your body. It has carried you through everything.

2. APOLOGY (3 minutes)
Place hands on heart. Speak to your body:
"Body, I'm sorry for all the times I hated you. I'm sorry for the harsh words, the punishment, the shame. You didn't deserve that. I'm sorry."
Let any tears flow.

3. BLESSING HEAD TO TOE (12 minutes)
Touch each body part and speak a blessing:

HAIR: "I bless my hair, crown of my being."
FACE: "I bless my face, which shows my soul to the world."
EYES: "I bless my eyes, windows to beauty."
EARS: "I bless my ears, receivers of sound."
NOSE: "I bless my nose, gateway of breath."
MOUTH: "I bless my mouth, speaker of truth."
NECK: "I bless my neck, bridge of head and heart."
SHOULDERS: "I bless my shoulders, which carry so much."
ARMS: "I bless my arms, which embrace and create."
HANDS: "I bless my hands, which touch and heal."
CHEST: "I bless my chest, home of my heart."
BREASTS: "I bless my breasts, symbols of nurturing."
BELLY: "I bless my belly, center of creativity."
WOMB SPACE: "I bless my womb, portal of creation."
HIPS: "I bless my hips, bowl of the sacred feminine."
THIGHS: "I bless my thighs, pillars of strength."
KNEES: "I bless my knees, which humble and rise."
LEGS: "I bless my legs, which carry me through life."
FEET: "I bless my feet, which connect me to Earth."

4. COMPLETION (5 minutes)
Place both hands on your body somewhere. Say:
"I am sacred. My body is a temple. I am enough exactly as I am."
Bow to your reflection. You are bowing to the divine.

DAILY PRACTICE:
Each morning, touch your heart and say: "I bless this body." That's all. The cumulative effect is profound."""
    },

    "breast-heart-healing-practice": {
        "deeper_teaching": """Breast and Heart: The Feminine Center of Love

The breasts sit directly over the heart chakra, creating a powerful connection between the capacity to nurture others and the capacity to love. For many women, this area holds deep pain—from cultural sexualization, from medical fears, from nursing struggles, from feeling inadequate.

CULTURAL WOUNDING

Women's breasts have been simultaneously hyper-sexualized and shamed in modern culture. You should have big breasts—but not show them. You should breastfeed—but not in public. Your breasts are for male pleasure—but nursing is gross. These contradictions wound the feminine psyche.

Add to this the very real fear of breast cancer—which affects 1 in 8 women—and the breast area becomes charged with anxiety. Many women have become disconnected from their breasts, unable to feel them as part of their wholeness.

HEART-BREAST CONNECTION

Emotionally, the breasts represent our capacity to nurture. When we give too much without receiving, the breasts and heart suffer. When we don't allow ourselves to be nurtured, the energy stagnates. Breast tissue, like heart tissue, needs the circulation of giving AND receiving.

Grief, too, lodges in this area. The heart breaks, and the pain spreads into the surrounding tissues. Many women carry unexpressed grief in their chests without knowing it.

HEALING THE BREAST-HEART

Healing comes through attention, touch, and energy flow. When we place loving hands on our breasts and heart, we're communicating: you are not forgotten, you are not shameful, you matter. We restore circulation of love.

This isn't about making breasts look a certain way. It's about feeling them as the sacred center of feminine love that they are.""",

        "somatic_practice": """BREAST AND HEART HEALING (20 minutes)

This practice is tender and may bring up emotion. Go gently.

PREPARATION:
Lie comfortably. Remove bra if wearing one. Have warm oil available if desired (coconut, almond, or rose-infused).

THE HEALING:

1. HEART BREATHING (5 minutes)
Place both hands over your heart.
Breathe into your heart space.
Feel the heart softening, expanding.
Acknowledge any grief, pain, or tightness stored here.

2. BREAST MASSAGE (10 minutes)
With warm oil, begin to gently massage your breasts.
Use circular motions, moving outward from the nipple.
This isn't sexual—it's healing, though sensations may arise.
As you massage, speak: "I love you. You are beautiful. You are sacred."
Notice any areas of tension or tenderness. Stay there longer.
Visualize pink and green light flowing through your hands into your breast tissue.

3. ENERGY CIRCULATION (3 minutes)
Cup your breasts gently.
Visualize energy flowing in a figure-8 pattern between heart and breasts.
Feel the connection—heart to right breast, right breast to heart, heart to left breast, left breast to heart.
This is the circulation of love.

4. COMPLETION (2 minutes)
Place hands back on heart.
Say: "My breasts are sacred. My heart is open. I give and receive love freely."
Rest with hands on heart. Feel the warmth and healing.

MONTHLY PRACTICE:
Along with monthly breast self-exams for health, add this loving practice. When you know your breasts with love, you notice changes from a place of connection, not fear."""
    },

    "yoni-honoring-practice": {
        "deeper_teaching": """Yoni: The Sacred Gateway

Yoni is the Sanskrit word for the female genitalia, meaning "sacred temple" or "source." In tantric tradition, the yoni is not shameful or dirty—it is revered as the gateway through which all life enters this world. The yoni is a microcosm of the creative power of the universe.

THE WOUND OF SHAME

Few areas of a woman's body carry more shame than the yoni. From childhood, many women learned that this area was dirty, ugly, or not to be touched or discussed. Sexual trauma compounds this wound. Even without overt trauma, the cultural silence and shame around female genitalia disconnects women from their creative power.

Many women don't look at their own yonis. Can't name their parts. Feel disgust rather than appreciation. This disconnection from the body's creative center has profound effects on self-esteem, sexuality, and life force.

THE YONI AS ORACLE

Ancient priestesses knew the yoni as an oracle—a place of deep knowing. The womb and yoni are connected to intuition, to the ability to know things without being told. When we disconnect from this area, we lose access to this knowing.

Honoring the yoni restores this connection. We begin to feel our "gut knowing" more clearly. Our intuition strengthens. We sense what's true for us in our bodies, not just our minds.

HEALING AND HONORING

Yoni honoring is not about sexuality, though sexuality may be part of a woman's relationship with her yoni. It's about acknowledgment, appreciation, and reverence. It's about ending the silence and shame.

This is tender, important work. Go at your own pace. There's no rush, no right way. Just gentle, gradual reconnection with this most sacred part of your physical being.""",

        "somatic_practice": """YONI HONORING PRACTICE (20 minutes)

This is sacred, tender work. Go only as far as feels right.

PREPARATION:
Private, warm space. A hand mirror. Perhaps rose water or oil. A candle. 

THE PRACTICE:

1. SETTING SACRED INTENTION (3 minutes)
Light your candle. Say: "I honor my yoni as sacred. I release all shame that was never mine. I return to reverence."

2. VISUAL HONORING (5 minutes)
If comfortable, use the mirror to look at your yoni.
If this is challenging, breathe and stay compassionate with yourself.
See your yoni as you would a flower—with appreciation for its unique beauty.
If shame arises, acknowledge it: "I see you, shame. You're not mine. I let you go."
Say to your yoni: "I see you. You are beautiful. You are sacred."

3. TOUCH WITH REVERENCE (7 minutes)
Gently place your hand over your yoni (over clothing is fine).
Send warmth and appreciation through your hand.
Speak: "I honor you, gateway of life. I honor your wisdom. I honor your power."
If comfortable, very gently touch the outer areas, the lips, the mound.
This is not sexual stimulation—it's loving acknowledgment.
Feel the life force concentrated in this area.

4. ENERGETIC CLEARING (3 minutes)
Visualize a beautiful rose pink light surrounding your yoni.
Any shame, trauma, or stagnant energy releases into this light.
The light purifies and restores.
Your yoni is clear, vibrant, sacred.

5. SEALING (2 minutes)
Place both hands on your lower belly.
Say: "My yoni is honored. My creative power is awake. I am the sacred feminine."

INTEGRATION:
This practice can bring up emotion, memory, or release. Journal afterward. Be gentle with yourself. This is lifetimes of healing."""
    },

    "mirror-love-practice": {
        "deeper_teaching": """Mirror Work: Confronting and Loving Your Reflection

The mirror shows us what we believe about ourselves. Stand before a mirror and watch the mind's commentary begin: too fat, too old, those wrinkles, that flaw. This running criticism reveals the internalized voices that prevent us from self-love.

THE MIRROR AS TEACHER

Louise Hay, pioneer of the mirror work practice, understood that the mirror confronts our deepest beliefs about worthiness. When we look into our own eyes and say "I love you," we meet the part of us that believes we're unlovable. This is uncomfortable—and transformative.

The mirror doesn't lie about our beliefs. If we cringe when we look, we know self-rejection is present. If we can look with tenderness, self-acceptance is growing. The mirror tracks our inner work.

WHY THIS IS HARD

Most of us learned self-love was conceited. We should be humble, critical, always improving. Self-love was confused with narcissism. But true self-love isn't narcissistic self-obsession—it's the basic acceptance that allows us to grow, receive, and give. Without self-love, we're empty, grasping, and unable to truly love others.

THE PRACTICE

Mirror work is simple but not easy. Looking into your own eyes and declaring love meets every voice that says you're not worthy. Do it anyway. The voices don't speak truth—they speak conditioning. Your reflection is the face of the sacred feminine. When you love her, you heal generations.""",

        "somatic_practice": """MIRROR OF LOVE PRACTICE (15 minutes)

This practice is challenging for many. Stay with it.

PREPARATION:
Stand or sit before a mirror where you can see your face clearly. This practice is done looking into your own eyes.

THE PRACTICE:

1. ARRIVAL (2 minutes)
Look at your reflection. Just look.
Notice the mental commentary—don't follow it.
Breathe. Stay present.

2. EYE CONTACT (3 minutes)
Look directly into your own eyes.
Hold your own gaze as you would hold the gaze of a beloved.
Stay. This may be uncomfortable. Stay anyway.
Your eyes are the windows to your soul. Meet yourself.

3. SPEAKING LOVE (5 minutes)
While maintaining eye contact, speak:
"[Your name], I love you."
Keep saying it. Notice reactions. Keep saying it.
"I love you. I really, truly love you."
"I forgive you for everything."
"You are worthy. You always have been."
"I'm here for you. I'll never abandon you."
Let whatever emotions arise move through.

4. BODY INCLUSION (3 minutes)
Expand your gaze to include your whole face, your shoulders.
Say: "I love all of you. Your face, your body, your being."
"You are beautiful exactly as you are."
If tears come, let them. This is healing.

5. COMPLETION (2 minutes)
Place your hand on the mirror, over your reflection's heart.
Say: "I promise to love you. Every day, I choose love."
Bow to your reflection. You are bowing to the sacred within.

DAILY PRACTICE:
Each morning, look in your eyes and say "I love you" three times. It takes 30 seconds and changes everything over time."""
    },

    "priestess-path-initiation": {
        "deeper_teaching": """The Priestess Path: Reclaiming Sacred Service

The archetype of the priestess exists in every woman—the part that connects earth to heaven, human to divine. For millennia, women served as priestesses in temples across the world: tending sacred flames, interpreting oracles, facilitating healing, and holding space for the mysteries.

WHAT IS A PRIESTESS?

A priestess is a woman who has committed to sacred service. She serves as a bridge between worlds—between the visible and invisible, between community and divine. She holds space for transformation, tends to sacred practice, and helps others access the sacred.

This doesn't require formal temples or external ordination. Every woman who consciously serves the sacred feminine is a priestess. When you light a candle with intention, you are priestessing. When you hold space for a friend's grief, you are priestessing. When you tend to the sacred in everyday life, you walk the priestess path.

THE SUPPRESSION OF THE PRIESTESS

For centuries, the priestess path was suppressed. Women who maintained their connection to the sacred feminine were labeled witches, heretics, and worse. The temples were destroyed, the lineages scattered. But the priestess archetype cannot be destroyed—it lives in the collective feminine soul.

Now, the priestess is returning. Women are remembering. Without formal instruction, they're building altars, gathering in circles, tending to the sacred. This is genetic memory awakening.

THE MODERN PRIESTESS

Today's priestess may look like: the woman who creates sacred space in her home, the therapist who knows healing is spiritual, the artist whose work opens portals, the mother who initiates her children into life's mysteries, the friend who naturally holds space for transformation.

The priestess path is not about being special or separate. It's about conscious service to the sacred in everyday life.""",

        "somatic_practice": """PRIESTESS INITIATION RITUAL (30 minutes)

This is a self-initiation—claiming the priestess path for yourself.

PREPARATION:
Create sacred space: altar, candle, any sacred objects. Dress in white or special clothing if possible. This is a ceremony.

THE INITIATION:

1. PURIFICATION (5 minutes)
Cleanse your hands and face with water.
Say: "I purify myself. I release all that is not in alignment with my highest service."
Breathe deeply, releasing old identities.

2. INVOCATION (3 minutes)
Stand before your altar.
Say: "I call upon the priestesses of all traditions—of Isis, of Avalon, of the temples unnamed. I call upon my spiritual mothers through all time. Witness this initiation. Support this dedication."

3. DEDICATION (5 minutes)
Place your hand on your heart.
Say: "I dedicate myself to the priestess path. I commit to:
- Tending the sacred in everyday life
- Serving the divine feminine
- Holding space for transformation
- Living my truth
- Walking between worlds
I am a priestess. I claim this birthright."

4. ANOINTING (5 minutes)
If you have oil, anoint your forehead, heart, and hands.
If not, touch these places with intention.
Say: "Forehead: May I see clearly. Heart: May I love fiercely. Hands: May I serve sacredly."

5. RECEIVING (7 minutes)
Sit in meditation. Open to receive.
The lineage of priestesses welcomes you.
You may receive visions, messages, or simply a sense of belonging.
Trust what comes.

6. SEALING (5 minutes)
Stand. Say: "It is done. I am initiated on the priestess path. I walk between worlds. I serve the sacred. So it is."
Blow out the candle. The flame lives within you now.

LIVING THE PATH:
A priestess is not what you do—it's how you do everything. Carry this dedication into your daily life."""
    },

    "moon-lodge-retreat": {
        "deeper_teaching": """The Moon Lodge: Honoring Menstrual and Cyclical Rest

In many indigenous cultures, menstruating women retreated to a special lodge during their moon time. This wasn't exile—it was honor. The menstruating woman was considered especially powerful, connected to the mystery of life and death. The blood itself was sacred.

THE ORIGINAL SABBATH

The moon lodge was the original sabbath—a built-in rest period for women. Away from daily responsibilities, women rested, dreamed, received visions, and connected with each other. This was not vacation; it was spiritual practice. Many of the tribe's most important visions came through women in the moon lodge.

THE MODERN LOSS

Modern life eliminated the moon lodge. Women are expected to perform equally all month, ignoring their cyclical nature. Menstruation became something to hide, to "manage," to pretend isn't happening. We lost the rhythm of rest and receive.

Many women are exhausted because they never rest. The moon time calls us inward, but we override it. The consequence is burnout, depletion, and disconnect from the feminine rhythms that would restore us.

CREATING YOUR MOON LODGE

You may not be able to retreat completely during menstruation, but you can create moon lodge practices: lighter schedules, time for rest, permission to go inward. Even small acknowledgments of your cyclical nature make a difference.

If you no longer menstruate, you can still observe moon lodge with the dark moon—the same rhythms, now guided by the sky rather than the body. The need for cyclical rest doesn't end with menstruation.""",

        "somatic_practice": """MOON LODGE RETREAT PRACTICE (Solo ritual, 2 hours minimum or as available)

Create your own moon lodge during menstruation or dark moon.

PREPARATION:
Clear your schedule as much as possible. Notify others you're retreating. Create a cozy, private space. Gather: journal, comfort items, gentle foods, water.

THE RETREAT:

1. THRESHOLD CROSSING (5 minutes)
Mark the beginning. Light a candle.
Say: "I enter my moon lodge. I honor my need to rest, receive, and renew. The outer world can wait."

2. PHYSICAL RELEASE (20 minutes)
If menstruating, acknowledge what your body is releasing.
If not, acknowledge what you're releasing emotionally/spiritually.
Rest in comfortable position. Let go of tension.
No productivity. No striving. Just being.

3. DREAMTIME (30+ minutes)
Sleep if you can. Rest if you can't.
Dreams during moon time are often prophetic.
Keep journal nearby for recording.
Let consciousness drift.

4. JOURNAL AND VISION (20 minutes)
Write freely: What is dying? What is being born?
What messages come from the deep feminine?
Moon time is thin-veil time. Receive what comes.

5. GENTLE NOURISHMENT (varies)
Eat warming, gentle foods.
Drink plenty of water and tea.
Nourish the body that is doing sacred work.

6. CLOSING THRESHOLD (5 minutes)
When your retreat ends, mark it.
Say: "I leave my moon lodge restored. I carry the wisdom I received. I re-enter the world renewed."
Blow out candle. Return gradually.

INTEGRATION:
Even a partial moon lodge changes your relationship to your cycle. Start small—an hour, an evening. Build from there. Your body will thank you."""
    },

    "sisterhood-circle-practice": {
        "deeper_teaching": """The Power of Sisterhood: Healing Through Circle

Women have gathered in circles since the beginning of human time. Around fires, in red tents, in moon lodges, at wells—wherever women gather in safety, magic happens. The circle is the shape of wholeness, equality, and the sacred feminine.

WHY CIRCLE HEALS

In circle, no one is at the head. All are equal. All are seen. This shape itself begins to heal the wounds of hierarchy and competition that patriarchy taught us.

In circle, we're witnessed. So much feminine pain comes from being unseen, unheard, dismissed. When we're truly witnessed by other women—without judgment, without trying to fix—we heal.

In circle, we remember we're not alone. So many women suffer in isolation, believing their struggles are unique. Circle reveals: you too? Oh, me too. The shame that thrives in secrecy dissolves in shared truth.

THE SUPPRESSION OF WOMEN'S CIRCLES

There's a reason women's gatherings have been demonized throughout history—called covens and witches' gatherings. Women in circle are powerful. They heal each other without patriarchal structures. They share information, support each other, organize. This power threatens systems built on keeping women isolated and competing.

CREATING CIRCLE

You don't need formal training to gather women in circle. You need: intention, safety, and willingness. Start small—three women is a circle. Create agreements: confidentiality, no advice-giving unless requested, equal sharing of time. The format matters less than the intention.

When women circle, the sacred feminine is invoked. She has been waiting for us to remember.""",

        "somatic_practice": """SISTERHOOD CIRCLE RITUAL (For a group of women)

This is a template for gathering in sacred circle.

PREPARATION:
Gather 3 or more women. Create sacred space—altar center, candles, flowers. Sit in a circle on floor or chairs, all equal.

THE CIRCLE:

1. OPENING (10 minutes)
One woman lights a central candle: "We light this flame for the sacred feminine. May this circle be held in love, safety, and truth."
Go around: each woman states her name and sets an intention for the circle.

2. AGREEMENTS (5 minutes)
Speak the agreements aloud: "What's shared here stays here. We listen without fixing. We share time equally. We honor each voice."

3. HEART SHARING (majority of time)
Using a talking piece (stone, feather), go around the circle.
Each woman shares what's on her heart. Others listen in silence.
No advice, no cross-talk. Just witnessing.
After each sharing, the group says: "We see you. We honor you."
Continue rounds until sharing feels complete.

4. SONGS/SOUNDS (optional, 10 minutes)
Sing together, tone, make sound.
Women's voices vibrating together is powerful medicine.

5. BLESSING (10 minutes)
Each woman receives a blessing from the circle.
One by one, a woman sits in the center.
Others place hands on her (with permission) and speak blessings:
"You are loved. You are seen. You are enough."
Rotate until all have received.

6. CLOSING (5 minutes)
All hold hands.
Say together: "We are sisters. We are whole. What we heal in ourselves, we heal for all women. Blessed be."
Blow out the candle together.

ONGOING PRACTICE:
Regular circle—weekly, monthly, at new/full moons—builds deep bonds and collective healing. The sisterhood wound heals in sisterhood."""
    },

    "wild-woman-awakening": {
        "deeper_teaching": """The Wild Woman: Remembering Your Untamed Nature

Beneath the "good girl," the people-pleaser, the one who follows rules and asks permission—there lives a wild woman. She is your instinctual nature, your connection to the natural world, your undomesticated soul. She has been caged, but she has not been killed.

WHO IS THE WILD WOMAN?

The Wild Woman is an archetype made famous by Clarissa Pinkola Estés in "Women Who Run with the Wolves." She is: intuitive knowing that doesn't need proof, creative power that doesn't ask permission, rage that refuses injustice, sexuality that isn't ashamed, the part of you that would howl at the moon if you let her.

She is the antidote to the over-civilized woman who has forgotten her instincts, her power, her voice. She is not polite. She is not small. She is not apologizing.

THE TAMING OF THE WILD

Women are systematically tamed. We learn to be nice, to make ourselves small, to prioritize others' comfort over our truth. The wild woman gets locked in the basement of the psyche. From there, she may emerge in eruptions of rage, depression, addiction—distorted expressions of caged power.

But she can be freed through choice. We can unlock the cage and let her run.

MEETING YOUR WILD

Meeting the wild woman is not about becoming reckless or destructive. It's about reclaiming the parts of yourself that were labeled "too much." Your intensity is not too much. Your desires are not too much. Your needs are not too much. You are not too much.

The wild woman knows what she wants. She trusts her instincts. She doesn't explain herself. She takes up space without apology. She is connected to the wild world—to animals, to weather, to the untamed earth.

She is in you. She is ready to run.""",

        "somatic_practice": """WILD WOMAN AWAKENING RITUAL (30 minutes)

This practice unlocks the cage. Prepare to make noise and move wildly.

PREPARATION:
Private space where you won't be disturbed or worry about noise. Wear loose clothing or nothing. Have wild music ready (drums, tribal rhythms).

THE AWAKENING:

1. FINDING HER (5 minutes)
Close your eyes. Breathe deep into your belly.
Call to her: "Wild woman, I'm ready to meet you. Show yourself."
Feel where she stirs in your body. She's been waiting.
She may appear as an image: a wolf, a dancing woman, a force of nature.
Acknowledge her: "I see you. I'm ready."

2. LETTING HER MOVE (15 minutes)
Put on wild music. 
Let her move your body. Not pretty dancing—wild movement.
Shake, stomp, flail, crawl, roll.
Make sounds. Growl. Howl. Cry out.
Don't edit. Don't make it nice. Let her loose.
This might feel crazy. It's not. It's medicine.

3. PRIMAL VOICE (5 minutes)
Stand or squat. Feel the ground beneath you.
Let sound come from your deep belly, your pelvis.
A growl. A roar. A howl. A scream. Whatever wants out.
Let the sounds get louder, more wild.
This is voice that doesn't ask permission.

4. INTEGRATION (5 minutes)
Come to stillness gradually.
Feel the aliveness in your body.
Place hands on your heart.
Say: "Wild woman, you are free now. We walk together."

ONGOING RELATIONSHIP:
The wild woman doesn't return to the cage. Once awakened, she needs regular expression. Dance wildly often. Speak up. Follow instincts. Spend time in wild nature. She is part of you now—acknowledge her daily."""
    }
}


async def update_feminine() -> None:
    """Add deeper teachings to all feminine embodiment practices."""
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    for practice_id, teachings in FEMININE_DEEPER_TEACHINGS.items():
        teachings["updated_at"] = timestamp
        
        result = await db.feminine_embodiment.update_one(
            {"id": practice_id},
            {"$set": teachings}
        )
        
        if result.modified_count:
            print(f"✅ Deepened: {practice_id}")
        else:
            print(f"⚠️  Not found or unchanged: {practice_id}")
    
    client.close()
    print("\n✨ Feminine embodiment deepening complete!")


if __name__ == "__main__":
    asyncio.run(update_feminine())
