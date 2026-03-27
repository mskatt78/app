"""
Spiritual purpose and energetic effects for key yoga poses.
Applied as additional fields to existing yoga_poses documents during seeding.
Keyed by pose name (lowercase, stripped).
"""

YOGA_SPIRITUAL_DATA = {
    # ─── EARTH ELEMENT ────────────────────────────────────────────────────────
    "mountain pose": {
        "spiritual_purpose": "The Mountain stands as the union of heaven and earth — rooted in the ground, reaching toward the sky. In Mountain Pose we discover that stillness is not absence of life but its most concentrated form. The spine becomes a column of sacred light. This is the pose of the one who knows who they are.",
        "energetic_effects": "Activates the root chakra through the soles of the feet. Brings the entire energy body into vertical alignment with Earth's gravitational field. Calms the nervous system through the practice of stillness."
    },
    "tree pose": {
        "spiritual_purpose": "The Tree grows in both directions simultaneously — roots deepening as branches reach higher. This pose teaches the fundamental spiritual principle: the higher we reach, the deeper we must root. It is a practice in the paradox of freedom through groundedness.",
        "energetic_effects": "Strengthens the root-crown connection. Activates both the Earth Star (through the standing foot's connection to ground) and the Crown (through the upward extension). Develops single-pointed focus — the focused quality of the third eye in physical form."
    },
    "warrior i": {
        "spiritual_purpose": "The spiritual warrior does not make war on enemies outside — they make peace with the enemies within. Warrior I teaches us to face our lives directly: front foot forward, looking ahead, arms raised in both surrender and power. The warrior who faces life fully is spiritually mature.",
        "energetic_effects": "Opens the solar plexus chakra through the expansion of the chest and engagement of the core. Builds the inner fire of will and courage. Strengthens the adrenal system and activates yang (solar, masculine) energy."
    },
    "warrior ii": {
        "spiritual_purpose": "Warrior II looks to the horizon with steady eyes — this is the gaze of the one who sees clearly and far. The extended arms span past and future while the heart remains open and steady. This pose embodies the spiritual quality of discernment: the capacity to see what is, without the distortion of hope or fear.",
        "energetic_effects": "Creates a powerful energy circuit between the two extended arms, activating the heart chakra as the central point. Grounds through the wide stance while opening through the extended arms. Builds equanimity in the nervous system."
    },
    "warrior iii": {
        "spiritual_purpose": "The warrior who can balance on one leg while extending fully into action — this is the advanced teaching: complete engagement with complete balance. Warrior III is the pose of the practitioner who has learned to move through the world without being destabilised by it.",
        "energetic_effects": "Demands full body integration — every chakra must participate for balance to be maintained. Activates the solar plexus through core engagement. Develops proprioception, which is the body's intelligence for knowing where it is in space — a physical analog of spiritual self-awareness."
    },
    "child's pose": {
        "spiritual_purpose": "In many traditions, bowing the head to the earth is the ultimate gesture of reverence. Child's Pose is a bow — to the ground that holds us, to the mystery that is larger than us, to the parts of ourselves that need rest without apology. It is the pose of trust.",
        "energetic_effects": "Activates the third eye through its contact with the ground (or supported position). Calms the entire sympathetic nervous system. Draws energy inward and downward — ideal for integration after strong practice or intense life experience."
    },
    "corpse pose": {
        "spiritual_purpose": "Savasana is the most difficult and most important pose. To lie completely still, to surrender all doing, to allow the body to integrate — this is the practice of small death before the great death. Every Savasana teaches us to release what we cannot carry, and to trust that we will rise again.",
        "energetic_effects": "Allows the integration of all the energetic work done in practice. The nervous system enters deep parasympathetic rest. The subtle body reorganises the energy moved through the practice. This is not rest — it is active spiritual integration happening beneath the threshold of awareness."
    },
    # ─── WATER ELEMENT ────────────────────────────────────────────────────────
    "seated forward fold": {
        "spiritual_purpose": "To fold forward and release the back body — which holds the unconscious, the past, what we cannot see — is an act of profound surrender. This pose teaches us to let go of what we are carrying behind us, and to discover that what we cannot see is also sacred.",
        "energetic_effects": "Stimulates the entire posterior energy line (the governing vessel in Chinese medicine), which runs from the coccyx to the crown. Activates the sacral chakra through deep hip flexion. Promotes introversion of the senses — withdrawal from outer stimulation, turning attention inward."
    },
    "pigeon pose": {
        "spiritual_purpose": "The hips are the body's emotional filing cabinet — particularly for grief, anger, and fear. Pigeon Pose opens the deepest stores of held emotion in the hip joint. Many practitioners cry unexpectedly in Pigeon — this is the body releasing what the mind could not process. This is genuine medicine.",
        "energetic_effects": "Deep opening of the sacral chakra — the emotional centre. Releases stored trauma and emotion held in the hip flexors and piriformis. The long hold required in Pigeon activates the yin (receptive, feminine, lunar) aspect of practice."
    },
    "butterfly pose": {
        "spiritual_purpose": "The butterfly only transforms through the willingness to dissolve. This gentle hip opener mirrors the process of spiritual metamorphosis — the willingness to become fluid, to let the old form dissolve, before the new one can emerge.",
        "energetic_effects": "Gentle sacral and root activation. Stimulates the reproductive organs and the creative energy housed there. The symmetrical opening creates energetic balance between the left (feminine/lunar) and right (masculine/solar) sides of the body."
    },
    # ─── FIRE ELEMENT ─────────────────────────────────────────────────────────
    "boat pose": {
        "spiritual_purpose": "The boat navigates open water — it is not afraid of the depths. Boat Pose builds the inner fire and core strength to navigate life's open waters without capsizing. The practice of staying in difficulty — maintaining the pose when it burns — is the practice of staying in life when it is hard.",
        "energetic_effects": "Powerful solar plexus activation — the centre of will, power, and identity. Strengthens the core energy structure of the body. Builds tapas — the inner fire of discipline and transformation."
    },
    "bridge pose": {
        "spiritual_purpose": "The bridge does not choose which shore it serves — it simply connects. Bridge Pose unites the lower body (earth, survival, instinct) with the upper body (heart, throat, mind) through a graceful arc. It is the pose of integration — body and spirit, earth and sky, giving and receiving.",
        "energetic_effects": "Opens the heart chakra while simultaneously grounding through the feet. Creates a powerful energy bridge along the entire front body. Stimulates the thyroid gland through neck extension — activating the throat chakra and metabolism of experience."
    },
    "camel pose": {
        "spiritual_purpose": "Full backbend is total openness — the body saying yes to life without reservation. This is the most vulnerable of the fire poses: the throat is exposed, the heart is fully open, the belly is unprotected. Camel Pose asks: can you be this open to life?",
        "energetic_effects": "Opens all chakras along the front body simultaneously. Deep heart and throat activation. Can release intense emotion — particularly grief and longing — stored in the chest and throat. A profound heart-opening practice."
    },
    # ─── AIR ELEMENT ──────────────────────────────────────────────────────────
    "downward facing dog": {
        "spiritual_purpose": "Adho Mukha Svanasana is said to refresh the brain and calm the mind — but more than that, it places the head below the heart. For those whose lives are lived predominantly in thought, this brief inversion is revolutionary: the heart becomes higher than the intellect, if only for a moment.",
        "energetic_effects": "Reverses the usual flow of awareness — energy moves from feet through the spine toward the hands. Activates the third eye through mild inversion. Calms the sympathetic nervous system. Creates space in the entire spine, allowing the energy channels (nadis) to flow more freely."
    },
    "eagle pose": {
        "spiritual_purpose": "The eagle sees the full landscape from above while remaining capable of precise action. Eagle Pose cultivates the two aspects of mature consciousness: panoramic awareness and precise focus. It is the pose of the one who can hold the big picture without losing attention to the detail.",
        "energetic_effects": "Wraps and then releases the energy channels at the shoulders and hips — the crossing creates compression, and the release after unwinding floods these areas with fresh energy. Activates the throat and heart chakras through the crossed arms."
    },
    "extended side angle": {
        "spiritual_purpose": "When we extend through the full length of one side body, we open the channels that run along the lateral meridians — the channels of the wood element in Chinese medicine, associated with vision, direction, and the capacity to grow through obstacles.",
        "energetic_effects": "Opens the lateral energy channels (gallbladder and liver meridians). Expands the breath capacity of the lungs on the upper side. Creates space in the sacral and solar plexus on the lower side. Builds the quality of decisive, directional energy."
    },
    # ─── SPIRIT ELEMENT ───────────────────────────────────────────────────────
    "headstand": {
        "spiritual_purpose": "To rest in the world upside down — this is the literal and symbolic practice of the mystic: seeing reality from an inverted perspective, understanding that what we call solid is mostly space, and what we call solid ground may not be the only ground available to us.",
        "energetic_effects": "Powerful crown chakra activation. Increases blood flow to the brain and pineal gland. Stimulates the crown-root axis, the central channel of the energy body. Develops the inner stillness required to remain calm in an inverted world."
    },
    "shoulder stand": {
        "spiritual_purpose": "The shoulder stand has been called 'the mother of asanas' — it nourishes all of life, as a mother does. By inverting the body with the support of the shoulders, we learn to support our spiritual life from the physical foundation we've built.",
        "energetic_effects": "Stimulates the thyroid and parathyroid glands — governing the metabolism of experience and communication. Activates the throat chakra through chin lock (jalandhara bandha). Creates a powerful inversion that reverses the downward flow of energy."
    },
    "lotus pose": {
        "spiritual_purpose": "The lotus grows from mud into light — its roots in the darkness of the pond, its flower in the open air. This is the essential teaching of the spiritual path: we are transformed by what we have survived, not despite it. The full expression of our beauty requires the darkness of the roots.",
        "energetic_effects": "Creates a sealed energetic circuit in the body — the crossed legs form a mudra with the entire lower body. Contains and intensifies the life force energy, drawing it upward through the chakras. The ultimate pose for meditation: stable, open, and self-contained."
    },
    "savasana": {
        "spiritual_purpose": "Savasana — the Corpse Pose — is the doorway through which every practice passes. We practice dying here so that we are not afraid of it in life. Each savasana is a rehearsal for the great releasing: the moment when we will finally put down every single thing we have been carrying. This is why it is sacred.",
        "energetic_effects": "Complete nervous system integration. The subtle body organises all the energy moved during practice. The cells receive the instruction of release and renewal. This is when the healing of the practice actually lands."
    }
}
