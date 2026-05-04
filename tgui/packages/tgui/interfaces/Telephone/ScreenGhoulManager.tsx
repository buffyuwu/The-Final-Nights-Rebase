// THIS IS A TFN UI FILE
import { useState } from 'react';
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

const HEALTH_COLORS: Record<string, string> = {
  healthy: '#3a3',
  injured: '#c80',
  incapacitated: '#a22',
};

const HEALTH_CYCLE: Record<string, string> = {
  healthy: 'injured',
  injured: 'incapacitated',
  incapacitated: 'healthy',
};

const GhoulSprite = ({
  hairStyle,
  outfit,
  shoes,
  size = 32,
}: {
  hairStyle: string;
  outfit: string;
  shoes: string;
  size?: number;
}) => {
  const s = `${size}px`;
  const layer: React.CSSProperties = { position: 'absolute', inset: 0, width: s, height: s };
  return (
    <Box style={{ position: 'relative', width: s, height: s, flexShrink: 0, imageRendering: 'pixelated' }}>
      <DmIcon icon="icons/mob/human/human.dmi" icon_state="human_basic" style={layer} />
      <DmIcon icon={WORN} icon_state={outfit} style={layer} />
      <DmIcon icon={WORN} icon_state={shoes} style={layer} />
      <DmIcon icon="icons/mob/human/human_face.dmi" icon_state={hairStyle} style={layer} />
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

const GhoulCard = ({ ghoul, act }: { ghoul: GhoulManagerGhoul; act: any }) => {
  const healthColor = HEALTH_COLORS[ghoul.health_status] || '#888';
  return (
    <Box
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        padding: '8px',
        marginBottom: '6px',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
      }}
    >
      <GhoulSprite hairStyle={ghoul.hair_style} outfit={ghoul.outfit} shoes={ghoul.shoes} />
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          <Box bold style={{ color: '#ccc', fontSize: '0.9em' }}>{ghoul.name}</Box>
          <Box
            style={{ color: healthColor, fontSize: '0.7em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', marginLeft: '4px' }}
            onClick={() => act('ghoul_manager_set_health', { name: ghoul.name, status: HEALTH_CYCLE[ghoul.health_status] || 'healthy' })}
          >
            - {ghoul.health_status}
          </Box>
        </Box>
        {!!ghoul.current_task && (
          <Box style={{ color: '#666', fontSize: '0.72em', marginBottom: '2px' }}>task: {ghoul.current_task}</Box>
        )}
        {!!ghoul.talk_text && (
          <Box style={{ color: '#555', fontSize: '0.72em', fontStyle: 'italic', marginBottom: '4px' }}>"{ghoul.talk_text}"</Box>
        )}
        <Box style={{ display: 'flex', gap: '4px' }}>
          <Button
            style={BUTTON_DARK}
            onClick={() => act('ghoul_manager_assign_task', { name: ghoul.name })}
          >
            Assign Task
          </Button>
          <Button
            style={BUTTON_DARK}
            onClick={() => act('ghoul_manager_talk', { name: ghoul.name })}
          >
            Talk
          </Button>
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
    <GhoulSprite hairStyle={recruit.hair_style} outfit={recruit.outfit} shoes={recruit.shoes} size={48} />
    <Box style={{ flex: 1 }}>
      <Box bold style={{ color: '#ccc', fontSize: '0.9em', marginBottom: '4px' }}>{recruit.name}</Box>
      <Box style={{ color: '#555', fontSize: '0.72em', marginBottom: '6px' }}>{recruit.outfit}</Box>
      <Button
        style={BUTTON_RED}
        onClick={() => act('ghoul_manager_recruit', { name: recruit.name })}
      >
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
  const [depositAmount, setDepositAmount] = useState('');

  const handleDeposit = () => {
    const amount = parseInt(depositAmount, 10);
    if (!amount || amount <= 0) return;
    act('ghoul_manager_deposit', { amount });
    setDepositAmount('');
  };

  if (!loggedIn) {
    return (
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #1a0505 0%, #0a0a0a 100%)' }}>
        {topBar('Shr3kN3t M4n4g3m3nt', () => setApp(null))}
        <Box style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Box bold textAlign="center" style={{ color: '#8b0000', fontSize: '1.6em', letterSpacing: '2px' }}>Shr3kN3t</Box>
          <Box textAlign="center" style={{ color: '#555', fontSize: '0.8em', letterSpacing: '1px' }}>M4n4g3m3nt</Box>
          <Box mt={4}>
            <Button
              style={BUTTON_RED}
              onClick={() => setLoggedIn(true)}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  if (recruiting) {
    const recruits = data.ghoul_manager_recruits || [];
    return (
      <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#bbb' }}>
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

  const ghouls = data.ghoul_manager_ghouls || [];
  const recruitsLeft = (data.ghoul_manager_recruits || []).length;

  return (
    <Box style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#0a0a0a', color: '#bbb' }}>
      {topBar('Shr3kN3t M4n4g3m3nt', () => setApp(null))}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Box>
            <Box style={{ color: '#555', fontSize: '0.75em' }}>account balance</Box>
            <Box bold style={{ color: '#c0c0c0', fontSize: '1.4em' }}>{data.ghoul_manager_balance ?? 0} cr</Box>
          </Box>
          <Box style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Input
              placeholder="amount"
              value={depositAmount}
              onChange={(val) => setDepositAmount(val)}
              style={{ width: '70px', background: '#1a1a1a', border: '1px solid #333', color: '#bbb', fontSize: '0.85em' }}
            />
            <Button
              style={BUTTON_RED}
              onClick={handleDeposit}
            >
              Deposit
            </Button>
          </Box>
        </Box>

        <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <Box style={{ color: '#555', fontSize: '0.8em' }}>ghouls ({ghouls.length})</Box>
          <Button
            style={BUTTON_RED}
            onClick={() => setRecruiting(true)}
            disabled={recruitsLeft === 0}
          >
            + Recruit ({recruitsLeft})
          </Button>
        </Box>

        {ghouls.length === 0 ? (
          <Box style={{ color: '#444', fontSize: '0.8em', textAlign: 'center', padding: '16px 0' }}>
            no ghouls registered :c
          </Box>
        ) : (
          ghouls.map((ghoul) => <GhoulCard key={ghoul.name} ghoul={ghoul} act={act} />)
        )}
      </Box>
    </Box>
  );
};
