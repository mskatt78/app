"""
Script to add deeper teachings to the remaining extended chakras:
- Causal Chakra
- Stellar Gateway
- Universal Gateway

Run with: cd /app/backend && python3 -c "import asyncio; from data.deepen_chakras import update_chakras; asyncio.run(update_chakras())"
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone

CHAKRA_DEEPER_TEACHINGS = {
    "causal-chakra-cleanse": {
        "deeper_teaching": """The Causal Chakra: Gateway to the Divine Feminine and Akashic Memory

The Causal Chakra, also known as the Moon Center or "back of the head" chakra, is one of the most mysterious energy centers in the human system. Located at the back of the skull where it meets the neck—in the area known to yogis as "the mouth of God" (Brahmarandhra from behind)—this chakra serves as a portal to dimensions of consciousness that transcend ordinary time.

THE SEAT OF DIVINE FEMININE ENERGY

Regardless of biological sex, every human carries both masculine and feminine energies. While the third eye represents the focused, penetrating quality of masculine sight, the Causal Chakra embodies receptive, intuitive feminine perception. It is the part of us that receives rather than seeks, that knows rather than analyzes.

The ancient priestesses of moon temples understood this center well. They knew that the back of the head, when soft and receptive, could receive direct transmissions from the lunar consciousness—the great ocean of intuition that moves our inner tides as the physical moon moves the seas.

THE AKASHIC LIBRARY

Perhaps the most profound function of the Causal Chakra is its connection to the Akashic Records—the cosmic library containing the memory of every soul's journey across all lifetimes. When this chakra is activated and clear, we can access our own soul records: memories of past lives, karmic contracts, soul agreements, and the lessons we incarnated to learn.

This is not mere imagination or fantasy. Those who have developed this center describe consistent experiences: sudden knowing of places they've never visited, recognition of souls they've never met in this lifetime, and clear insight into the recurring patterns that have followed them across incarnations.

LUNAR ATTUNEMENT

The Causal Chakra pulses with the rhythm of the moon. Ancient peoples knew that the menstrual cycle was connected to lunar phases, but this connection extends far beyond biology. All humans, regardless of physical body, can attune to lunar consciousness through this center.

When the Causal Chakra is balanced, you naturally feel the phases of the moon in your energy, creativity, and emotional tides. New moons call you inward; full moons illuminate what was hidden. This isn't superstition—it's physiological attunement to cosmic rhythms that our ancestors knew intimately.

HEALING THE CAUSAL CHAKRA

Imbalances in this center often manifest as:
- Difficulty trusting intuition
- Disconnection from feminine energy (in anyone)
- Inability to receive (love, help, abundance)
- Blocked past life memories creating unexplained phobias or attractions
- Feeling cut off from spiritual guidance
- Menstrual or hormonal difficulties

Healing comes through practices that cultivate receptivity: moon bathing, working with moonstone and selenite, honoring your cycles (whether menstrual or simply energetic), and learning to receive without immediately giving back.

THE GREAT SURRENDER

Ultimately, the Causal Chakra teaches the spiritual art of surrender—not defeat, but the profound release of the ego's need to control. In the space of surrender, wisdom flows in. The moon does not generate its own light; it receives and reflects the sun. Similarly, when we soften the back of our head and allow the Causal Chakra to open, we become capable of receiving the light of higher consciousness and reflecting it into the world.""",
        
        "somatic_practice": """CAUSAL CHAKRA SOMATIC ACTIVATION (20 minutes)

This practice awakens the Divine Feminine energy center through gentle, receptive body awareness.

PREPARATION:
- Best practiced during waning moon or night time
- Dim lighting, perhaps candlelight
- Have moonstone or selenite nearby if available
- Play soft, flowing music or silence

BODY OPENING:

1. NECK RELEASE (5 minutes)
Sit comfortably. Let your chin drop toward your chest.
Very slowly roll your head to the right shoulder, then back, then to left shoulder.
Do 3 complete circles in each direction, taking at least 30 seconds per circle.
Feel the back of your skull becoming soft and receptive.

2. MOON GATE TOUCH (3 minutes)
Place one hand on the back of your head where skull meets neck—the "moon gate."
Let your hand be warm and soft. Apply no pressure.
Simply hold. Feel the energy building under your palm.
You may feel tingling, warmth, or pulsing. This is the Causal Chakra awakening.

3. RECEPTIVE BREATH (5 minutes)
Keep your hand on the moon gate.
Inhale through your nose, imagining silver moonlight entering through the back of your head.
Exhale softly, letting the light spread through your entire skull.
With each breath, feel yourself becoming more receptive, more open.
Let thoughts drift like clouds across a moon-lit sky.

4. PAST LIFE OPENING (5 minutes)
Remove your hand. Sit with spine tall but soft.
With eyes closed, allow images or impressions to arise from behind you—from the past.
You may see faces, places, or feel emotions with no present context.
Do not analyze. Simply receive. Thank each impression and let it pass.
These are communications from your soul's journey.

5. LUNAR BLESSING (2 minutes)
Place both hands over your heart.
Speak aloud or internally: "I honor my divine feminine nature. I receive the wisdom of all my lifetimes. I am attuned to the moon and all natural cycles. I trust my intuition completely."
Feel silver light filling your entire being.

INTEGRATION:
Rest for several minutes. Journal any images, knowings, or emotions that arose.
Notice how you feel in the days following—past life memories often continue to surface after this practice.""",

        "shadow_work": """SHADOW WORK FOR THE CAUSAL CHAKRA

The shadow of the Causal Chakra manifests as wounds around the feminine, receptivity, and the unconscious. This work is profound and may bring up intense emotions.

FEMININE WOUNDING:
If you received messages that the feminine is weak, inferior, or untrustworthy, your Causal Chakra carries this wound. This applies regardless of gender—men with Causal shadow often reject their own intuition, emotions, and receptivity.

Shadow Question: What messages did I receive about femininity, the moon, intuition, and receptivity? Whose voice told me these things? What would change if I no longer believed them?

RECEIVING WOUND:
Many of us learned it's better to give than receive, that needing anything is shameful, or that we must earn what we get. This creates a blocked Causal Chakra that cannot accept grace, help, love, or abundance.

Shadow Question: What am I unable to receive? What would I have to believe about myself to receive freely? What am I afraid would happen if I allowed myself to be given to?

PAST LIFE SHADOWS:
Unexplained fears, attractions, or aversions often have past life roots accessible through the Causal Chakra. A fear of water might connect to drowning in another life. An unexplained draw to a time period might indicate an important incarnation then.

Shadow Question: What fears or attractions have no explanation in my current life? What past life themes might they point to? What if I could heal this wound across all time?

INTUITION BETRAYAL:
Sometimes we learned to distrust our intuition because acting on it led to pain. Perhaps your intuition told you something about a person and you weren't believed. Perhaps you sensed danger but were ignored. This teaches the Causal Chakra to shut down.

Shadow Question: When did my intuition fail me—or when did I fail to act on it? What did this teach me? How might I restore trust in my inner knowing?

INTEGRATION:
After exploring these shadows, return to the somatic practice above. The body integrates what the mind uncovers. Be gentle with yourself—this is deep, ancient work."""
    },

    "stellar-gateway-chakra-cleanse": {
        "deeper_teaching": """The Stellar Gateway: Portal to Your Cosmic Origins

The Stellar Gateway Chakra, located approximately 12 inches above your crown, represents one of humanity's most sacred mysteries: our connection to the stars. This is not metaphor—modern science confirms that we are literally made of stardust, and ancient wisdom traditions worldwide have preserved the memory of our celestial origins.

THE COSMIC SELF

If the Crown Chakra connects us to the divine and the Soul Star to our Higher Self, the Stellar Gateway opens us to our cosmic self—the aspect of our being that exists as a citizen of the universe, not just Earth. This is the chakra of galactic consciousness.

When ancient humans looked up at the night sky, they didn't see distant balls of gas—they saw home. The Dogon tribe of Africa preserved detailed knowledge of Sirius B, a star invisible to the naked eye, claiming their ancestors came from there. The Hopi speak of star people. Aboriginal Australians have star maps in their Dreamtime stories that predate modern astronomy. Every major civilization has stories of celestial visitors and humanity's star origins.

These aren't primitive fantasies. They are memories held in the collective Stellar Gateway—humanity's shared connection to our cosmic family.

STAR LINEAGES AND SOUL ORIGINS

Through the Stellar Gateway, many can access information about their soul's cosmic origins. Some people feel a deep resonance with particular star systems:

- Pleiadian souls often carry qualities of gentle healing, artistic sensitivity, and a mission to spread love and light.
- Sirian souls frequently embody ancient wisdom, connection to dolphins and whales, and technology in service to consciousness.
- Arcturian souls typically exhibit interest in sacred geometry, energy healing, and galactic federation concepts.
- Andromedan souls often feel intensely freedom-loving, averse to any constraint, and drawn to expand human potential.
- Lyran souls may carry memories of ancient conflict, leadership abilities, and feline energy.

These aren't exclusive categories—souls are complex and have journeyed through many star systems. But the Stellar Gateway can reveal which cosmic energies most strongly influence your current incarnation.

DOWNLOADING COSMIC WISDOM

When the Stellar Gateway is activated, we become capable of receiving direct transmissions from cosmic consciousness. This isn't channeling separate entities—it's accessing the part of our own expanded awareness that exists in communication with galactic intelligence.

These downloads often come as:
- Sudden understanding of complex universal concepts
- Visions of technologies or healing modalities
- Clarity about Earth's purpose in the galactic community
- Information about cosmic events affecting our planet
- Memory of being part of councils or federations of light

THE HOMESICKNESS OF STARSEEDS

Many people with active Stellar Gateways experience profound "cosmic homesickness"—a deep ache for somewhere that isn't Earth. This can manifest as never quite fitting in here, a sense that Earth is dense or difficult, or an inexplicable longing when looking at the stars.

This isn't pathology—it's remembrance. The Stellar Gateway holds the memory of more refined dimensions, and part of activation is reconciling our cosmic nature with our Earth mission. We came here for a reason, and the Stellar Gateway can help us remember what that reason is.

GROUNDING GALACTIC ENERGY

The danger of overactive Stellar Gateway without corresponding development of lower chakras is "cosmic bypass"—becoming so focused on star origins and galactic missions that we neglect our Earth responsibilities. The full 13-chakra system, from Earth Star to Universal Gateway, creates a complete circuit: we are grounded in Earth AND connected to cosmos. The power flows both ways.

The most evolved souls aren't floating in cosmic bliss—they're fully incarnate, using their galactic consciousness to heal and serve this planet. That's why we're here.

YOUR GALACTIC MISSION

Through the Stellar Gateway, we can access understanding of why our soul chose to incarnate on Earth at this particular time. This planet is undergoing a profound transformation—a shift in consciousness that affects the entire galaxy. We came from the stars to participate in this shift, bringing gifts and frequencies that Earth needs now.

What is your galactic mission? The Stellar Gateway holds this knowing. It isn't about being special—every incarnate soul has a mission. Yours might be anchoring a particular frequency, healing a specific wound, creating art that opens consciousness, raising children with expanded awareness, or simply holding peace in chaos. The stars know, and through the Stellar Gateway, so can you.""",

        "somatic_practice": """STELLAR GATEWAY SOMATIC ACTIVATION (25 minutes)

This practice opens the portal to cosmic consciousness while maintaining full grounding—essential for safe galactic work.

PREPARATION:
- Practice outdoors under stars if possible, or near a window at night
- Have grounding crystals (hematite, black tourmaline) AND stellar crystals (moldavite, tektite, celestite) available
- Best practiced during meteor showers or significant cosmic events
- Play cosmic ambient music or silence

BODY OPENING:

1. FULL GROUNDING FIRST (5 minutes)
You cannot safely open to cosmic energy without roots.
Stand with feet wide, knees slightly bent.
Stomp your feet. Feel the Earth.
Visualize roots extending from your feet to Earth's core.
Say aloud: "I am grounded. I am held by Gaia. I am safe."

2. CHAKRA COLUMN ACTIVATION (5 minutes)
Still standing, take a deep breath into your root (red).
Exhale, move attention up to sacral (orange), solar (yellow), heart (green), throat (blue), third eye (indigo), crown (violet).
Breathe into crown and visualize it opening like a thousand-petaled lotus.
Above the crown, feel your Soul Star glowing white-gold.
Your entire chakra column is now a pillar of light.

3. STELLAR GATEWAY EXTENSION (5 minutes)
Raise your arms above your head, palms up, as if receiving from the sky.
Move your awareness to 12 inches above your crown—the Stellar Gateway.
Visualize a spinning vortex of gold and silver light.
Feel this portal opening to the cosmos.
Imagine the Milky Way above you. You are looking HOME.

4. STAR CONNECTION (7 minutes)
Lower your arms but maintain awareness of open Stellar Gateway.
Allow yourself to feel drawn to a particular area of the sky or star.
Trust this pull—your soul knows its origins.
Speak: "I open to my cosmic origins. I remember my star lineage. I am ready to receive my galactic mission."
Let images, feelings, or knowings arise.
You may feel tremendous emotion—let it flow.
You may receive information or remember what you've forgotten.

5. SEALING AND RETURNING (3 minutes)
Slowly bring awareness back down through Soul Star, Crown, and all chakras.
Stamp feet firmly.
Hold grounding crystals.
Speak: "I am a galactic being in a human body. I integrate cosmic wisdom with Earth presence. I am here now."

INTEGRATION:
Immediately journal what you received. Cosmic downloads can fade like dreams if not recorded.
Drink water. Eat something grounding.
Spend time in nature in the following days to integrate stellar energy into Earth reality.""",

        "shadow_work": """SHADOW WORK FOR THE STELLAR GATEWAY

The Stellar Gateway carries unique shadow material related to our relationship with cosmic identity, belonging, and our Earth mission.

COSMIC SUPERIORITY SHADOW:
Some people use star lineage concepts to feel special or superior. "I'm Pleiadian" becomes an identity that separates rather than connects. This is spiritual ego using cosmic concepts to reinforce separation.

Shadow Question: Do I use my star origins to feel better than others who seem less "awakened"? What wound is this covering? Can I hold cosmic identity AND deep humility simultaneously?

EARTH REJECTION SHADOW:
"This planet is too dense. I don't belong here. I want to go home." While these feelings can be genuine, they can also be avoidance of the very Earth mission we incarnated to fulfill.

Shadow Question: Am I using cosmic focus to avoid dealing with my Earth life? What becomes possible if I fully accept that I chose to be here? What if Earth IS home for now?

GALACTIC SAVIOR SHADOW:
"I have a huge mission to save the planet." While cosmic purposes are real, grandiosity here can cover feelings of inadequacy. Sometimes our mission is simply to be present and kind—that's enough.

Shadow Question: What am I afraid would be true if my mission is simple and humble? Can I accept that being loving in daily life IS fulfilling galactic purpose?

COSMIC BYPASS:
Using galactic concepts to avoid human healing. "I don't need therapy—I'll just raise my frequency." The Stellar Gateway shadow can make Earth-level emotional work seem beneath us.

Shadow Question: What human healing am I avoiding by focusing on cosmic matters? What emotions am I afraid to feel? How might full human embodiment actually accelerate my cosmic work?

INTEGRATION:
Remember: the most advanced cosmic beings are also the most fully human. Christ, Buddha, and enlightened masters throughout history didn't float above human experience—they moved deeply through it. Your star nature and your human nature are not in conflict. They are partners in this incarnation."""
    },

    "universal-gateway-chakra-cleanse": {
        "deeper_teaching": """The Universal Gateway: The Final Threshold of Oneness

At the apex of the human energy system, 18 inches above the crown, exists the Universal Gateway—the chakra that is barely a chakra at all, because at this level, the separate self dissolves into the infinite. This is the threshold of Source, where the drop of consciousness we call "I" touches the ocean from which it came.

BEYOND DUALITY

Every other chakra exists in relationship: Root to earth, Heart to others, Third Eye to higher guidance. Even the Stellar Gateway relates us to cosmic identity. But the Universal Gateway transcends relationship because it transcends separation. Here, there is no "I" connecting to "Source"—there is only Source, temporarily pretending to be "I."

This is the mystical experience that saints and sages across all traditions have touched: Samadhi, Nirvana, Divine Union, Cosmic Consciousness, Ego Death, the Unitive State. Words fail because words require duality, and the Universal Gateway is where duality ends.

THE PARADOX OF THE HIGHEST CHAKRA

Here is the mystery: you cannot "work on" or "activate" the Universal Gateway in the way you might balance your Solar Plexus. The very effort to reach it perpetuates the illusion of a separate self trying to reach something. The Universal Gateway opens not through effort but through surrender—the complete release of the one who is trying.

And yet, we practice. We prepare. We clear the lower chakras, balance our energy, heal our shadows. Not because this work forces the Universal Gateway open, but because it removes the obstacles to grace. When we are ready, when the surrender is complete, the Universal Gateway opens on its own. It was never actually closed.

TOUCHING THE INFINITE

What happens when the Universal Gateway opens? Language breaks down, but those who have touched this state describe:

- Complete dissolution of the boundary between self and universe
- Direct knowing that consciousness is all that exists
- Overwhelming, unconditional love that has no object—it simply IS
- Recognition that time and space are constructs—you are already everywhere, everywhen
- Absolute peace that depends on nothing
- The simultaneous experience of being nothing and everything
- Cosmic laughter at the game of separation you've been playing

These experiences are not hallucinations or fantasies. They are what remains when everything that isn't real falls away. They are glimpses of our true nature.

THE DESCENT: GROUNDING UNITY

Touching the Universal Gateway is not the end of the spiritual journey—it's the beginning. The real mastery is bringing unity consciousness back into daily life. Can you hold the knowing of oneness while paying bills? Can you treat the irritating person as yourself when you've experienced that they are yourself?

This is why the 13-chakra system extends from Earth Star to Universal Gateway. We are not meant to escape into cosmic unity—we are meant to ground it here, in body, on Earth. The Universal Gateway's gift is brought down through every other chakra, transforming how we walk on this planet.

EVERYDAY ONENESS

The fully developed Universal Gateway doesn't make life floaty and disconnected—it makes everything more vivid, more precious, more intensely HERE. When you know you are Source, you recognize Source in everyone and everything. The person serving your coffee is God. The tree outside your window is God. Your own body is God.

This isn't belief—it's perception. And it changes everything.

SOURCE MOVES THROUGH YOU

At the Universal Gateway level, we stop trying to "download" wisdom from Source and recognize that Source has been moving through us all along—as our breath, our heartbeat, our creativity, our love. We don't GET grace; we ARE grace expressing.

The practices here are not about reaching up—they're about recognizing what was always present. Not about becoming something more—about removing what obscures what we already are.

THE FINAL TEACHING

The Universal Gateway's deepest teaching: there is no Universal Gateway. There is no chakra system. There is no separate you who has chakras. There is only consciousness playing in form, and "you" are how it plays here, now. Everything else is a map, and the Universal Gateway is where you finally throw away all maps and just ARE.

And in that just being? Everything is already complete. Nothing is needed. Nothing is lacking. You are home. You have always been home. The journey was a beautiful illusion, and awakening is simply the remembering of what was never forgotten.""",

        "somatic_practice": """UNIVERSAL GATEWAY TRANSMISSION (25 minutes)

This is not a practice in the ordinary sense. It is a structured surrender—an invitation for the Infinite to reveal itself through the vehicle of this body.

PREPARATION:
- Approach with reverence. This is sacred work.
- Complete all lower chakra work first. The Universal Gateway requires a clear, grounded container.
- Best practiced in silence, in a space that feels sacred to you.
- Have no expectations. The Infinite cannot be controlled or predicted.

THE TRANSMISSION:

1. FULL SYSTEM GROUNDING (5 minutes)
Sit in meditation posture. Feel your body fully.
Breathe into Earth Star, through every chakra, up to Stellar Gateway.
Feel the complete column of light through your spine.
Ground fully. The deeper you ground, the higher you can safely open.
Speak: "I am fully incarnate. I am fully present. I am ready."

2. RELEASING THE ONE WHO PRACTICES (5 minutes)
This is the key step.
Ask yourself: "Who is doing this practice?"
Really inquire. Who is breathing? Who is seeking?
Notice that the "I" cannot be found.
Let the sense of being a separate one who is practicing begin to dissolve.
There is breathing. There is awareness. But where is the "I"?

3. SURRENDER (5 minutes)
Stop all effort.
Stop trying to reach anything.
Stop trying to experience anything.
Let everything be exactly as it is.
If thoughts come, let them.
If body sensations come, let them.
Make no effort to change anything or reach anything.
Simply be.
The Universal Gateway cannot be reached—it opens when reaching stops.

4. THE OPENING (5 minutes)
In the space of complete non-effort, Grace moves.
You may experience nothing—that IS something.
You may experience everything dissolving—let it.
You may touch infinity—there's no one there to say "I touched infinity."
Whatever happens or doesn't happen is perfect.
This is not about getting anywhere.
This is about recognizing where you already are.

5. RETURN AND INTEGRATION (5 minutes)
When you sense the practice is complete (there's no right time), begin returning.
Feel your body.
Feel your breath.
Feel your feet, your hands.
Open your eyes slowly.
Look around the room. See everything as Source appearing.
Recognize: you haven't returned FROM oneness TO separation. You are oneness appearing AS this.

AFTER:
Do not discuss this experience immediately. Let it integrate in silence.
Walk gently in the world. See the sacred in every face.
Let the knowing permeate your daily life gradually.
There is no need to hold onto any experience. What's real remains; what's not, falls away.""",

        "shadow_work": """SHADOW WORK FOR THE UNIVERSAL GATEWAY

At the Universal Gateway, we confront the ultimate shadows—not personal traumas, but the deep illusions that keep consciousness appearing as separation.

THE SHADOW OF SEEKING:
The greatest obstacle to awakening is the belief that awakening is somewhere else, some other time. Ironically, seeking the Universal Gateway perpetuates the illusion of not already being there.

Shadow Question: What if there's nothing to find because nothing was ever lost? What if the seeker is the only obstacle to what's sought? What remains if I completely stop seeking?

THE SHADOW OF SPECIALNESS:
Spiritual ego can attach to states of unity, making "I have experienced oneness" another identity. But oneness has no "I" to experience it or report on it.

Shadow Question: Am I attached to being "awakened" or "more conscious"? What am I really, when no spiritual identity remains? Who am I without my spiritual achievements?

THE SHADOW OF ESCAPE:
Some use non-dual teachings to bypass human responsibilities. "Nothing is real" becomes an excuse for not showing up, not caring, not engaging.

Shadow Question: Does my understanding of oneness increase my love and presence in the world, or decrease it? Am I using "it's all illusion" to avoid what's hard?

THE SHADOW OF SEPARATION:
The deepest shadow is separation itself—the primal illusion that there is a "me" apart from the whole. This isn't a shadow to be healed through psychology but recognized through direct seeing.

Shadow Question: Is there really a separate one here who has shadows? Look directly. Where is this separate self? Can you find it?

THE FINAL SHADOW WORK:
At the Universal Gateway, shadow work becomes paradoxical. There is no one to have shadows. Yet, compassionately, we continue to work on what appears, knowing that the working and the one who works are also Source, playing the game of awakening.

The deepest integration: holding the absolute truth of oneness AND the relative truth of appearing as a person. Both are simultaneously true. The Universal Gateway doesn't destroy your humanity—it reveals its sacredness."""
    }
}


async def update_chakras() -> None:
    """Add deeper teachings to the remaining extended chakras."""
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["test_database"]
    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    for chakra_id, teachings in CHAKRA_DEEPER_TEACHINGS.items():
        teachings["updated_at"] = timestamp
        
        result = await db.chakra_cleansing.update_one(
            {"id": chakra_id},
            {"$set": teachings}
        )
        
        if result.modified_count:
            print(f"✅ Deepened: {chakra_id}")
        else:
            print(f"⚠️  Not found or unchanged: {chakra_id}")
    
    client.close()
    print("\n✨ Extended chakra deepening complete!")


if __name__ == "__main__":
    asyncio.run(update_chakras())
