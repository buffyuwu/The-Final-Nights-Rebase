// THIS IS A TFN UI FILE
import { useState, useMemo } from 'react';
import { useBackend } from 'tgui/backend';
import { Box, Button, DmIcon, Icon, Input } from 'tgui-core/components';

import type { Data, GhoulManagerGhoul, GhoulManagerRecruit, NavigableApps } from '.';

const WORN = 'modular_darkpack/modules/clothes/icons/worn.dmi';

const BUTTON_STYLE: React.CSSProperties = {
  minWidth: '60px',
  padding: '3px 8px',
  fontSize: '0.75em',
  textAlign: 'center',
};

const BUTTON_DARK: React.CSSProperties = { ...BUTTON_STYLE, background: '#2a2a2a', border: '1px solid #3a3a3a', color: '#999' };
const BUTTON_RED: React.CSSProperties = { ...BUTTON_STYLE, background: '#3d0000', border: '1px solid #8b0000', color: '#ccc' };
const BUTTON_DANGER: React.CSSProperties = { ...BUTTON_STYLE, background: '#1a0505', border: '1px solid #5a0000', color: '#8b0000' };

const HEALTH_COLORS: Record<string, string> = {
  healthy: '#3a3',
  injured: '#c80',
  incapacitated: '#a22',
};

const MOOD_WORDS: string[][] = [
  ['Miserable', 'Despondent', 'Awful', 'Hopeless'],
  ['Struggling', 'Worn down', 'Out of sorts', 'Not doing great'],
  ['Getting by', 'Alright', 'Okay', 'Fine'],
  ['Doing well', 'Content', 'Pretty good', 'Settled'],
  ['Thriving', 'Happy', 'Delighted', 'Cheerful'],
];

const pickMoodWord = (mood: number): string => {
  const mood_value = mood ?? 5;
  const tier = mood_value <= 2 ? 0 : mood_value <= 4 ? 1 : mood_value <= 6 ? 2 : mood_value <= 8 ? 3 : 4;
  const words = MOOD_WORDS[tier];
  return words[Math.floor(Math.random() * words.length)];
};

const TALK_PROMPTS = [
  'How are things?',
  'Doing okay?',
  'Updates for me?',
  'Everything alright?',
  'Checking in.',
  'What\'s going on?',
  'How\'s it going?',
  'Need anything?',
];

const to12Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  return timeStr.replace(/(\d{1,2}):(\d{2})$/, (_, h, m) => {
    const hour = parseInt(h, 10);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  });
};

const HAIR_FILTERS: Record<string, string> = {
  '#1a1008': 'brightness(0.08) sepia(0.5)',
  '#2b1d0e': 'sepia(1) brightness(0.18)',
  '#3d2b1f': 'sepia(1) brightness(0.25)',
  '#6b4226': 'sepia(1) brightness(0.45) saturate(1.5)',
  '#8b1a1a': 'sepia(1) saturate(8) hue-rotate(330deg) brightness(0.65)',
  '#c8a96e': 'sepia(0.5) brightness(0.82) saturate(1.2)',
  '#d4a855': 'sepia(0.8) brightness(0.88)',
  '#4a3728': 'sepia(1) brightness(0.3) saturate(1.3)',
  '#002262': 'sepia(1) saturate(8) hue-rotate(200deg) brightness(0.3)',
};

const GhoulSprite = ({
  hairStyle,
  hairColor,
  outfit,
  shoes,
  size = 96,
}: {
  hairStyle: string;
  hairColor: string;
  outfit: string;
  shoes: string;
  size?: number;
}) => {
  const s = `${size}px`;
  const layer: React.CSSProperties = { position: 'absolute', inset: 0, width: s, height: s };
  const hairFilter = HAIR_FILTERS[hairColor];
  return (
    <Box style={{ position: 'relative', width: s, height: s, flexShrink: 0, imageRendering: 'pixelated' }}>
      <DmIcon icon="icons/mob/human/human.dmi" icon_state="human_basic" style={layer} />
      <DmIcon icon={WORN} icon_state={outfit} style={layer} />
      <DmIcon icon={WORN} icon_state={shoes} style={layer} />
      <DmIcon icon="icons/mob/human/human_face.dmi" icon_state={hairStyle} style={{ ...layer, filter: hairFilter }} />
    </Box>
  );
};

const topBar = (title: string, onBack: () => void) => (
  <Box
    style={{
      background: '#1a0505',
      padding: '6px 8px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0,
    }}
  >
    <Icon name="arrow-left" onClick={onBack} style={{ cursor: 'pointer', color: '#8b0000' }} />
    <Box style={{ color: '#8b0000', fontSize: '0.9em' }}>{title}</Box>
  </Box>
);

const ProgressBar = ({ progress, active }: { progress: number; active: boolean }) => (
  <Box style={{ background: '#474747', borderRadius: '2px', height: '5px', overflow: 'hidden' }}>
    <Box
      style={{
        background: active ? '#8b0000' : '#3a3',
        height: '100%',
        width: `${Math.min(progress * 100, 100)}%`,
        transition: 'width 0.3s',
      }}
    />
  </Box>
);

const GhoulCard = ({ ghoul, taskLabel, onClick }: { ghoul: GhoulManagerGhoul; taskLabel?: string; onClick: () => void }) => {
  const healthColor = HEALTH_COLORS[ghoul.health_status] || '#888';
  const moodWord = useMemo(() => pickMoodWord(ghoul.mood ?? 5), [ghoul.name, ghoul.mood]);
  return (
    <Box
      onClick={onClick}
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        padding: '8px',
        marginBottom: '6px',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
        cursor: 'pointer',
      }}
    >
      <GhoulSprite hairStyle={ghoul.hair_style} hairColor={ghoul.hair_color} outfit={ghoul.outfit} shoes={ghoul.shoes} size={32} />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <Box bold style={{ color: '#ccc', fontSize: '0.9em' }}>{ghoul.name}</Box>
          <Box style={{ color: healthColor, fontSize: '0.7em', whiteSpace: 'nowrap', marginLeft: '4px' }}>
            {ghoul.health_status.charAt(0).toUpperCase() + ghoul.health_status.slice(1)}
          </Box>
        </Box>
        <Box style={{ color: '#555', fontSize: '0.7em' }}>Status: {moodWord}</Box>
        {!!ghoul.current_task && (
          <Box style={{ color: '#666', fontSize: '0.72em', marginTop: '2px' }}>Task: {taskLabel || ghoul.current_task}</Box>
        )}
      </Box>
    </Box>
  );
};

const GhoulDetail = ({ ghoul, onBack }: { ghoul: GhoulManagerGhoul; onBack: () => void }) => {
  const { act, data } = useBackend<Data>();
  const [showAssignTask, setShowAssignTask] = useState(false);

  const healthColor = HEALTH_COLORS[ghoul.health_status] || '#888';
  const activity = [...(ghoul.activity || [])].reverse();
  const tasks = data.ghoul_manager_tasks || [];
  const now = data.current_realtime || 0;

  const moodWord = useMemo(() => pickMoodWord(ghoul.mood ?? 5), [ghoul.name, ghoul.mood]);

  const taskActive = !!(ghoul.current_task && ghoul.task_started && ghoul.task_duration && now < ghoul.task_started + ghoul.task_duration);
  const taskProgress = ghoul.task_started && ghoul.task_duration
    ? Math.min((now - ghoul.task_started) / ghoul.task_duration, 1)
    : 0;
  const hoursRemaining = taskActive
    ? ((ghoul.task_started + ghoul.task_duration - now) / 36000).toFixed(1) // me math good
    : '0';

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#bbb', fontSize: '1.5em' }}>
      {topBar(ghoul.name, onBack)}
      <Box style={{ display: 'flex', justifyContent: 'center', paddingTop: '12px', background: '#0a0a0a', flexShrink: 0, position: 'relative', zIndex: 0 }}>
        <GhoulSprite hairStyle={ghoul.hair_style} hairColor={ghoul.hair_color} outfit={ghoul.outfit} shoes={ghoul.shoes} size={128} />
      </Box>
      <Box
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginTop: '-56px',
          background: '#141414',
          borderRadius: '8px 8px 0 0',
          position: 'relative',
          zIndex: 1,
          overflow: 'hidden',
        }}
      >
        <Box style={{ padding: '12px 12px 0 12px', flexShrink: 0 }}>
          <Box style={{ textAlign: 'center', marginBottom: '2px' }}>
            <Box bold style={{ color: '#ccc', fontSize: '1em' }}>{ghoul.name}</Box>
            <Box style={{ fontSize: '0.72em' }}>
              <span style={{ color: '#ccc' }}>Status: </span>
              <span style={{ color: healthColor }}>{ghoul.health_status.charAt(0).toUpperCase() + ghoul.health_status.slice(1)}</span>
            </Box>
          </Box>
          <Box style={{ fontSize: '0.72em', textAlign: 'center', marginBottom: '10px' }}>
            <span style={{ color: '#ccc' }}>Status: </span>
            <span style={{ color: (ghoul.mood ?? 5) <= 3 ? '#8b0000' : (ghoul.mood ?? 5) <= 6 ? '#c87000' : '#3a3' }}>{moodWord}</span>
          </Box>

          {!!ghoul.current_task && (
            <Box style={{ marginBottom: '10px' }}>
              <Box style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72em', color: '#666', marginBottom: '3px' }}>
                <Box>{tasks.find((t) => t.id === ghoul.current_task)?.label || ghoul.current_task}</Box>
                {taskActive
                  ? <Box>{hoursRemaining}h remaining</Box>
                  : <Box style={{ color: '#3a3' }}>complete</Box>}
              </Box>
              <ProgressBar progress={taskProgress} active={taskActive} />
            </Box>
          )}

          <Box style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {!taskActive && (
              <Button style={showAssignTask ? BUTTON_DARK : BUTTON_RED} onClick={() => setShowAssignTask(!showAssignTask)}>
                {showAssignTask ? 'Cancel' : 'Assign Task'}
              </Button>
            )}
            <Button style={BUTTON_DARK} onClick={() => act('ghoul_manager_talk', { name: ghoul.name, prompt: TALK_PROMPTS[Math.floor(Math.random() * TALK_PROMPTS.length)] })}>
              Talk
            </Button>
            <Button style={BUTTON_DANGER} onClick={() => act('ghoul_manager_release', { name: ghoul.name })}>
              Release
            </Button>
          </Box>
        </Box>
        <Box style={{ flex: 1, overflowY: 'auto', padding: '0.5em 12px 3em', background: '#fff' }}>
          {showAssignTask ? (
            <Box>
              <Box style={{ color: '#444', fontSize: '0.72em', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                assign task
              </Box>
              {tasks.filter((task) => {
                const completed = ghoul.completed_tasks || [];
                if (completed.includes(task.id)) return false;
                if (task.requires && !completed.includes(task.requires)) return false;
                if (task.conflicts) {
                  const conflictList = Array.isArray(task.conflicts) ? task.conflicts : [task.conflicts];
                  if (conflictList.some((c) => completed.includes(c))) return false;
                }
                return true;
              }).map((task) => (
                <Box
                  key={task.id}
                  onClick={() => {
                    act('ghoul_manager_assign_task', { name: ghoul.name, task_id: task.id });
                    setShowAssignTask(false);
                  }}
                  style={{
                    border: '1px solid #2a2a2a',
                    borderRadius: '4px',
                    padding: '10px',
                    marginBottom: '6px',
                    cursor: 'pointer',
                    background: '#1a1a1a',
                  }}
                >
                  <Box bold style={{ color: '#ccc', fontSize: '0.9em', marginBottom: '2px' }}>{task.label}</Box>
                  <Box style={{ color: '#555', fontSize: '0.75em', marginBottom: '2px' }}>{task.details}</Box>
                  <Box style={{ color: '#444', fontSize: '0.72em' }}>{task.duration_hours}h</Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box>
              {activity.length === 0 ? (
                <Box style={{ color: '#333', fontSize: '0.75em', textAlign: 'center' }}>no messages yet</Box>
              ) : (
                activity.map((entry, i) => {
                  const out = !!entry.outgoing;
                  return (
                    <Box key={i} style={{ display: 'flex', justifyContent: out ? 'flex-end' : 'flex-start', marginBottom: '6px' }}>
                      <Box style={{
                        background: out ? '#0069ff' : '#e8e8e8',
                        color: out ? '#fff' : '#000',
                        borderRadius: out ? '10px 10px 2px 10px' : '10px 10px 10px 2px',
                        padding: '6px 10px',
                        maxWidth: '78%',
                        wordWrap: 'break-word',
                        fontSize: '0.8em',
                      }}>
                        {entry.text}
                        <Box style={{ fontSize: '0.72em', color: out ? '#ffffff' : '#777', marginTop: '3px', textAlign: out ? 'right' : 'left' }}>
                          {to12Hour(entry.time)}
                        </Box>
                      </Box>
                    </Box>
                  );
                })
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const RecruitCard = ({ recruit, act }: { recruit: GhoulManagerRecruit; act: any }) => (
  <Box
    style={{
      background: '#141414',
      border: '1px solid #2a2a2a',
      borderRadius: '4px',
      padding: '10px',
      display: 'flex',
      gap: '12px',
      alignItems: 'center',
    }}
  >
    <GhoulSprite hairStyle={recruit.hair_style} hairColor={recruit.hair_color} outfit={recruit.outfit} shoes={recruit.shoes} size={48} />
    <Box style={{ flex: 1 }}>
      <Box bold style={{ color: '#ccc', fontSize: '0.9em', marginBottom: '6px' }}>{recruit.name}</Box>
      <Button style={BUTTON_RED} onClick={() => act('ghoul_manager_recruit', { name: recruit.name })}>
        Recruit
      </Button>
    </Box>
  </Box>
);

export const ScreenGhoulManager = (props: {
  setApp: React.Dispatch<React.SetStateAction<NavigableApps | null>>;
}) => {
  const { act, data } = useBackend<Data>();
  const { setApp } = props;
  const [loggedIn, setLoggedIn] = useState(false);
  const [recruiting, setRecruiting] = useState(false);
  const [selectedGhoul, setSelectedGhoul] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = () => {
    const amount = parseInt(depositAmount, 10);
    if (!amount || amount <= 0) return;
    act('ghoul_manager_deposit', { amount });
    setDepositAmount('');
  };

  if (!loggedIn) {
    return (
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #1a0505 0%, #0a0a0a 100%)', fontSize: '1.5em' }}>
        {topBar('Shr3kN3t M4n4g3m3nt', () => setApp(null))}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box bold textAlign="center" style={{ color: '#8b0000', fontSize: '1.6em', letterSpacing: '2px' }}>Shr3kN3t</Box>
          <Box textAlign="center" style={{ color: '#555', fontSize: '0.8em', letterSpacing: '1px' }}>M4n4g3m3nt</Box>
          <Box mt={4}>
            <Button style={BUTTON_RED} onClick={() => setLoggedIn(true)}>
              Login
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  const ghouls = data.ghoul_manager_ghouls || [];

  if (selectedGhoul) {
    const ghoul = ghouls.find((g) => g.name === selectedGhoul);
    if (!ghoul) {
      setSelectedGhoul(null);
    } else {
      return <GhoulDetail ghoul={ghoul} onBack={() => setSelectedGhoul(null)} />;
    }
  }

  if (recruiting) {
    const recruits = data.ghoul_manager_recruits || [];
    return (
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#bbb', fontSize: '1.5em' }}>
        {topBar('Available Recruits', () => setRecruiting(false))}
        <Box style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {recruits.length === 0 ? (
            <Box style={{ color: '#444', fontSize: '0.8em', textAlign: 'center', padding: '24px 0' }}>
              no recruits available this round
            </Box>
          ) : (
            <Box style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {recruits.map((r) => (
                <RecruitCard key={r.name} recruit={r} act={act} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  }

  const recruitsLeft = (data.ghoul_manager_recruits || []).length;

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#bbb', fontSize: '1.5em' }}>
      {topBar('Shr3kN3t M4n4g3m3nt', () => setApp(null))}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Box>
            <Box style={{ color: '#555', fontSize: '0.75em' }}>account balance</Box>
            <Box bold style={{ color: '#c0c0c0', fontSize: '1.4em' }}>${data.ghoul_manager_balance ?? 0}</Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'stretch', gap: '4px' }}>
            <Input
              placeholder=""
              value={depositAmount}
              onChange={(val) => setDepositAmount(val)}
              style={{ width: '70px', background: '#1a1a1a', border: '1px solid #333', color: '#bbb', fontSize: '0.85em', padding: '3px 8px', boxSizing: 'border-box' }}
            />
            <Button style={BUTTON_RED} onClick={handleDeposit}>
              Deposit
            </Button>
          </Box>
        </Box>

        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <Box style={{ color: '#555', fontSize: '0.8em' }}>ghouls ({ghouls.length})</Box>
          <Button style={BUTTON_RED} onClick={() => setRecruiting(true)} disabled={recruitsLeft === 0}>
            + Recruit ({recruitsLeft})
          </Button>
        </Box>

        {ghouls.length === 0 ? (
          <Box style={{ color: '#444', fontSize: '0.8em', textAlign: 'center', padding: '16px 0' }}>
            no ghouls registered. recruit one!
          </Box>
        ) : (
          ghouls.map((ghoul) => (
            <GhoulCard
                key={ghoul.name}
                ghoul={ghoul}
                taskLabel={(data.ghoul_manager_tasks || []).find((t) => t.id === ghoul.current_task)?.label}
                onClick={() => setSelectedGhoul(ghoul.name)}
              />
          ))
        )}
      </Box>
    </Box>
  );
};
