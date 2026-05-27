// THIS IS A TFN UI FILE
import { useMemo, useState } from 'react';
import { resolveAsset } from 'tgui/assets';
import { useBackend } from 'tgui/backend';
import { Box, Icon, Stack } from 'tgui-core/components';

import type { Data, NavigableApps } from '.';

const BUTTON_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: '0.85em',
  cursor: 'pointer',
  borderRadius: '3px',
  marginBottom: '6px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const BUTTON_RED: React.CSSProperties = {
  ...BUTTON_STYLE,
  background: '#1a0505',
  border: '1px solid #8b0000',
  color: '#ccc',
};

const BUTTON_DARK: React.CSSProperties = {
  ...BUTTON_STYLE,
  background: '#141414',
  border: '1px solid #2a2a2a',
  color: '#555',
  cursor: 'default',
};

const CONFIRM_RED: React.CSSProperties = {
  padding: '3px 8px',
  fontSize: '1.5em',
  cursor: 'pointer',
  borderRadius: '2px',
  background: '#3d0000',
  border: '1px solid #8b0000',
  color: '#ccc',
};

const CONFIRM_DARK: React.CSSProperties = {
  ...CONFIRM_RED,
  background: '#2a2a2a',
  border: '1px solid #3a3a3a',
  color: '#999',
};

const INPUT_STYLE: React.CSSProperties = {
  background: '#0a0a0a',
  border: '1px solid #3a3a3a',
  color: '#ccc',
  padding: '4px 6px',
  fontSize: '0.8em',
  borderRadius: '2px',
  width: '100%',
  boxSizing: 'border-box',
};

const LOGIN_TAGLINES = [
  'more secretive than prince Solomon!',
  'holler holler get dollar!',
  'crazy licks only!',
  'welcome back, loser!',
  'take a contract, punk!',
  'sponsored by the shadow government!',
  'gauranteed to piss your sire off!',
  'mortal eyes cant see it!',
  'pet your local malkavian!',
  'also known as ShreckNET!',
];

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};
const DIFFICULTY_COLORS: Record<number, string> = {
  1: '#3a3',
  2: '#c80',
  3: '#a22',
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
    <Icon
      name="arrow-left"
      onClick={onBack}
      style={{ cursor: 'pointer', color: '#8b0000' }}
    />
    <Box style={{ color: '#8b0000', fontSize: '0.9em' }}>{title}</Box>
  </Box>
);

const LoginScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [tagline] = useState(
    () => LOGIN_TAGLINES[Math.floor(Math.random() * LOGIN_TAGLINES.length)],
  );
  return (
    <Box
      style={{
        background: 'linear-gradient(180deg, #1a0505 0%, #0a0a0a 100%)',
        height: '100%',
        fontSize: '1.5em',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
      }}
    >
      <Box
        className="Shr3kNet__CinzelFont"
        style={{
          color: '#8b0000',
          fontSize: '1.8em',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
        }}
      >
        Shr3kNet
      </Box>
      <Box
        style={{
          color: '#444',
          fontSize: '0.85em',
          padding: '0 15px',
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        {tagline}
      </Box>
      <Box style={{ marginTop: '12px' }}>
        <Box
          onClick={onLogin}
          style={{
            ...BUTTON_RED,
            padding: '6px 24px',
            fontSize: '0.85em',
            justifyContent: 'center',
          }}
        >
          Log In
        </Box>
      </Box>
    </Box>
  );
};

type View = 'menu' | 'leaderboard' | 'contracts' | 'post';

type Contract = {
  type: string;
  name: string;
  summary: string;
  difficulty: number;
  is_player_contract?: boolean;
  poster?: string;
  reward?: number;
  player_contract_id?: number;
};
type ActiveContract = {
  name: string;
  description: string;
  difficulty: number;
  progress: string | null;
  completed: boolean;
  is_player_contract?: boolean;
  reward?: number;
  poster?: string;
};
type LeaderboardEntry = {
  username: string;
  triumphs: number;
  is_self: boolean;
};
type MyPostedContract = {
  id: number;
  name: string;
  description: string;
  reward: number;
  claimer_name: string | null;
  is_claimed: boolean;
};

const LeaderboardScreen = ({
  onBack,
  triumphs,
  username,
  leaderboard,
  onSetUsername,
}: {
  onBack: () => void;
  triumphs: number;
  username: string;
  leaderboard: LeaderboardEntry[];
  onSetUsername: (name: string) => void;
}) => {
  const [inputName, setInputName] = useState('');
  const [registering, setRegistering] = useState(false);

  const hasUsername = !!username;
  const sorted = [...leaderboard].sort((a, b) => b.triumphs - a.triumphs);

  return (
    <Box
      style={{
        background: '#0a0a0a',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {topBar('Leaderboard', onBack)}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {!hasUsername && !registering && (
          <Box
            style={{
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '10px',
              textAlign: 'center',
            }}
          >
            <Box
              style={{ color: '#888', fontSize: '0.8em', marginBottom: '8px' }}
            >
              Register a username to appear on the nearby leaderboard.
            </Box>
            <Box
              onClick={() => setRegistering(true)}
              style={{
                ...BUTTON_RED,
                justifyContent: 'center',
                display: 'inline-flex',
              }}
            >
              Register
            </Box>
          </Box>
        )}

        {registering && (
          <Box
            style={{
              background: '#141414',
              border: '1px solid #8b0000',
              borderRadius: '4px',
              padding: '10px',
              marginBottom: '10px',
            }}
          >
            <Box
              style={{ color: '#888', fontSize: '1.75em', marginBottom: '6px' }}
            >
              {hasUsername
                ? `Change username (costs 5 triumphs, you have ${triumphs})`
                : 'Choose a username'}
            </Box>
            <input
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              maxLength={32}
              placeholder="username..."
              style={INPUT_STYLE}
            />
            <Box style={{ marginTop: '6px' }}>
              <Stack vertical>
                <Stack.Item>
                  <Box
                    onClick={() => {
                      if (inputName.trim()) {
                        onSetUsername(inputName.trim());
                        setInputName('');
                        setRegistering(false);
                      }
                    }}
                    style={CONFIRM_RED}
                  >
                    Confirm
                  </Box>
                </Stack.Item>
                <Stack.Item mt={1}>
                  <Box
                    onClick={() => {
                      setRegistering(false);
                      setInputName('');
                    }}
                    style={CONFIRM_DARK}
                  >
                    Cancel
                  </Box>
                </Stack.Item>
              </Stack>
            </Box>
          </Box>
        )}

        {hasUsername && !registering && (
          <Box
            style={{ color: '#555', fontSize: '0.7em', marginBottom: '2px' }}
          >
            Logged in as{' '}
            <Box as="span" style={{ color: '#8b0000' }}>
              {username}
            </Box>{' '}
            -{' '}
            <Box
              as="span"
              onClick={() => setRegistering(true)}
              style={{
                color: '#555',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.9em',
              }}
            >
              change
            </Box>
          </Box>
        )}

        <Box
          style={{
            color: '#8b0000',
            fontSize: '0.7em',
            marginBottom: '4px',
            marginTop: '8px',
            letterSpacing: '0.05em',
          }}
        >
          RANKINGS (NEARBY)
        </Box>

        {sorted.length === 0 && (
          <Box
            style={{
              color: '#333',
              fontSize: '0.8em',
              textAlign: 'center',
              marginTop: '16px',
            }}
          >
            Noone else is nearby {':('}
          </Box>
        )}

        {sorted.map((entry, i) => (
          <Box
            key={entry.username}
            style={{
              background: entry.is_self ? '#1a0505' : '#141414',
              border: `1px solid ${entry.is_self ? '#8b0000' : '#2a2a2a'}`,
              borderRadius: '3px',
              padding: '6px 8px',
              marginBottom: '4px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Box
              style={{
                color: entry.is_self ? '#ccc' : '#888',
                fontSize: '0.8em',
              }}
            >
              <Box as="span" style={{ color: '#555', marginRight: '6px' }}>
                #{i + 1}
              </Box>
              {entry.username}
            </Box>
            <Box style={{ color: '#8b0000', fontSize: '0.8em' }}>
              {entry.triumphs}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const ContractCard = ({
  contract,
  onAccept,
}: {
  contract: Contract;
  onAccept: () => void;
}) => {
  const [confirming, setConfirming] = useState(false);
  const [hovered, setHovered] = useState(false);
  const difficultyColor = DIFFICULTY_COLORS[contract.difficulty] || '#888';
  const difficultyLabel = DIFFICULTY_LABELS[contract.difficulty] || '?';

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderRadius: '4px',
        padding: '8px',
        marginBottom: '6px',
      }}
    >
      <Stack align="center" justify="space-between">
        <Stack.Item grow>
          <Box style={{ color: '#ccc', fontSize: '1.5em', fontWeight: 'bold' }}>
            {contract.name}
          </Box>
          {contract.is_player_contract ? (
            <>
              <Box
                style={{ color: '#c80', fontSize: '0.7em', marginTop: '2px' }}
              >
                Reward: {contract.reward} triumph
                {contract.reward !== 1 ? 's' : ''}
              </Box>
              <Box style={{ color: '#555', fontSize: '0.65em' }}>
                posted by {contract.poster}
              </Box>
            </>
          ) : (
            <Box
              style={{
                color: difficultyColor,
                fontSize: '1.4em',
                marginTop: '2px',
              }}
            >
              {difficultyLabel} - {contract.difficulty} triumph
              {contract.difficulty !== 1 ? 's' : ''}
            </Box>
          )}
          {hovered && (
            <Box
              style={{
                color: '#666',
                fontSize: '2em',
                marginTop: '4px',
                fontStyle: 'italic',
              }}
            >
              {contract.summary}
            </Box>
          )}
        </Stack.Item>
        <Stack.Item>
          {confirming ? (
            <Stack vertical>
              <Stack.Item>
                <Box
                  onClick={() => {
                    onAccept();
                    setConfirming(false);
                  }}
                  style={CONFIRM_RED}
                >
                  Confirm
                </Box>
              </Stack.Item>
              <Stack.Item mt={1}>
                <Box onClick={() => setConfirming(false)} style={CONFIRM_DARK}>
                  Cancel
                </Box>
              </Stack.Item>
            </Stack>
          ) : (
            <Box
              onClick={() => setConfirming(true)}
              style={{ ...CONFIRM_RED, fontSize: '1.5em' }}
            >
              {contract.is_player_contract ? 'Claim' : 'Accept'}
            </Box>
          )}
        </Stack.Item>
      </Stack>
    </div>
  );
};

const MyPostedContractCard = ({
  contract,
  triumphs,
  onComplete,
  onRemove,
}: {
  contract: MyPostedContract;
  triumphs: number;
  onComplete: () => void;
  onRemove: () => void;
}) => {
  const [confirmAction, setConfirmAction] = useState<
    'complete' | 'remove' | null
  >(null);
  const canAfford = triumphs >= contract.reward;

  if (confirmAction === 'complete') {
    return (
      <div
        style={{
          background: '#1a0505',
          border: '1px solid #8b0000',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '6px',
        }}
      >
        <Box style={{ color: '#ccc', fontSize: '0.85em', marginBottom: '4px' }}>
          Mark "{contract.name}" as complete?
        </Box>
        <Box
          style={{
            color: canAfford ? '#c80' : '#a22',
            fontSize: '1.75em',
            marginBottom: '8px',
          }}
        >
          {canAfford
            ? `This will deduct ${contract.reward} triumph${contract.reward !== 1 ? 's' : ''} from your balance.`
            : `You don't have enough triumphs (need ${contract.reward}, have ${triumphs}).`}
        </Box>
        <Stack vertical>
          <Stack.Item>
            <Box
              onClick={() => {
                if (canAfford) {
                  onComplete();
                }
                setConfirmAction(null);
              }}
              style={canAfford ? CONFIRM_RED : CONFIRM_DARK}
            >
              {canAfford ? 'Confirm' : 'Cannot Afford'}
            </Box>
          </Stack.Item>
          <Stack.Item mt={1}>
            <Box onClick={() => setConfirmAction(null)} style={CONFIRM_DARK}>
              Cancel
            </Box>
          </Stack.Item>
        </Stack>
      </div>
    );
  }

  if (confirmAction === 'remove') {
    return (
      <div
        style={{
          background: '#141414',
          border: '1px solid #5a2a00',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '6px',
        }}
      >
        <Box style={{ color: '#ccc', fontSize: '0.85em', marginBottom: '4px' }}>
          Remove this contract?
        </Box>
        {contract.is_claimed && (
          <Box
            style={{ color: '#a22', fontSize: '1.75em', marginBottom: '8px' }}
          >
            Warning: {contract.claimer_name} has claimed this. They will receive
            no payment.
          </Box>
        )}
        <Stack vertical>
          <Stack.Item>
            <Box
              onClick={() => {
                onRemove();
                setConfirmAction(null);
              }}
              style={CONFIRM_RED}
            >
              Remove
            </Box>
          </Stack.Item>
          <Stack.Item mt={1}>
            <Box onClick={() => setConfirmAction(null)} style={CONFIRM_DARK}>
              Cancel
            </Box>
          </Stack.Item>
        </Stack>
      </div>
    );
  }

  return (
    <div
      style={{
        background: '#141414',
        border: '1px solid #3a2a00',
        borderRadius: '4px',
        padding: '8px',
        marginBottom: '6px',
      }}
    >
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <Box style={{ flex: 1, marginRight: '8px' }}>
          <Box style={{ color: '#ccc', fontSize: '1.5em', fontWeight: 'bold' }}>
            {contract.name}
          </Box>
          <Box style={{ color: '#666', fontSize: '1em', marginTop: '2px' }}>
            {contract.description}
          </Box>
          <Box style={{ marginTop: '4px' }}>
            {contract.is_claimed ? (
              <Box style={{ color: '#888', fontSize: '1.7em' }}>
                Claimed by{' '}
                <Box as="span" style={{ color: '#ccc' }}>
                  {contract.claimer_name}
                </Box>
              </Box>
            ) : (
              <Box style={{ color: '#555', fontSize: '1.7em' }}>Unclaimed</Box>
            )}
          </Box>
        </Box>
        <Box style={{ flexShrink: 0, textAlign: 'right' }}>
          <Box
            style={{ color: '#c80', fontSize: '1.75em', marginBottom: '4px' }}
          >
            {contract.reward} triumph{contract.reward !== 1 ? 's' : ''}
          </Box>
          <Stack>
            {contract.is_claimed && (
              <Stack.Item>
                <Box
                  onClick={() => setConfirmAction('complete')}
                  style={CONFIRM_RED}
                >
                  Complete
                </Box>
              </Stack.Item>
            )}
            <Stack.Item ml={contract.is_claimed ? 1 : 0}>
              <Box
                onClick={() => setConfirmAction('remove')}
                style={CONFIRM_DARK}
              >
                Remove
              </Box>
            </Stack.Item>
          </Stack>
        </Box>
      </Box>
    </div>
  );
};

const ActiveContractCard = ({ contract }: { contract: ActiveContract }) => {
  const difficultyColor = DIFFICULTY_COLORS[contract.difficulty] || '#888';
  return (
    <Box
      style={{
        background: '#141414',
        border: `1px solid ${contract.completed ? '#1a3a1a' : '#2a2a2a'}`,
        borderRadius: '4px',
        padding: '8px',
        marginBottom: '6px',
        opacity: contract.completed ? 0.7 : 1,
      }}
    >
      <Box
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box style={{ color: '#ccc', fontSize: '1.5em', fontWeight: 'bold' }}>
          {contract.name}
          {!!contract.completed && (
            <Box
              as="span"
              style={{ color: '#3a3', marginLeft: '6px', fontSize: '0.8em' }}
            >
              done
            </Box>
          )}
        </Box>
        {contract.is_player_contract ? (
          <Box style={{ color: '#c80', fontSize: '1.75em' }}>
            +{contract.reward} triumphs
          </Box>
        ) : (
          contract.progress !== null &&
          !contract.completed && (
            <Box style={{ color: difficultyColor, fontSize: '1.75em' }}>
              {contract.progress}
            </Box>
          )
        )}
      </Box>
      <Box style={{ color: '#666', fontSize: '1em', marginTop: '3px' }}>
        {contract.description}
      </Box>
      {contract.is_player_contract && (
        <Box style={{ color: '#555', fontSize: '0.65em', marginTop: '2px' }}>
          posted by {contract.poster} - awaiting their review
        </Box>
      )}
    </Box>
  );
};

const PostContractForm = ({
  onBack,
  triumphs,
  onPost,
}: {
  onBack: () => void;
  triumphs: number;
  onPost: (name: string, description: string, reward: number) => void;
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [reward, setReward] = useState(1);

  const canPost =
    name.trim().length > 0 &&
    description.trim().length > 0 &&
    reward >= 1 &&
    reward <= triumphs;

  return (
    <Box
      style={{
        background: '#0a0a0a',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {topBar('Post Contract', onBack)}
      <Box style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        <Box style={{ textAlign: 'center', marginBottom: '10px' }}>
          <Box
            className="Shr3kNet__CinzelFont"
            style={{
              color: '#8b0000',
              fontSize: '1.7em',
              letterSpacing: '0.05em',
            }}
          >
            TRIUMPHS
          </Box>
          <Box
            className="Shr3kNet__CinzelFont"
            style={{ color: '#ccc', fontSize: '1.5em', fontWeight: 'bold' }}
          >
            {triumphs}
          </Box>
        </Box>

        <Box style={{ marginBottom: '8px' }}>
          <Box
            style={{ color: '#888', fontSize: '1.75em', marginBottom: '3px' }}
          >
            Contract Name
          </Box>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            placeholder="e.g. Exterminate the Rats"
            style={INPUT_STYLE}
          />
        </Box>

        <Box style={{ marginBottom: '8px' }}>
          <Box
            style={{ color: '#888', fontSize: '1.75em', marginBottom: '3px' }}
          >
            Description
          </Box>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            placeholder="What does the claimer need to do..."
            style={
              {
                ...INPUT_STYLE,
                height: '60px',
                resize: 'none',
              } as React.CSSProperties
            }
          />
        </Box>

        <Box style={{ marginBottom: '14px' }}>
          <Box
            style={{ color: '#888', fontSize: '1.75em', marginBottom: '3px' }}
          >
            Reward (1 - {triumphs} triumphs)
          </Box>
          <input
            type="number"
            value={reward}
            onChange={(e) =>
              setReward(
                Math.min(
                  triumphs,
                  Math.max(1, parseInt(e.target.value, 10) || 1),
                ),
              )
            }
            min={1}
            max={triumphs}
            style={{ ...INPUT_STYLE, width: '80px' }}
          />
        </Box>

        <Box
          onClick={() =>
            canPost && onPost(name.trim(), description.trim(), reward)
          }
          style={canPost ? BUTTON_RED : BUTTON_DARK}
        >
          <Icon
            name="plus"
            style={{ color: canPost ? '#8b0000' : '#333', width: '16px' }}
          />
          Post Contract
        </Box>
      </Box>
    </Box>
  );
};

const ContractsScreen = ({
  onBack,
  onPostNew,
  triumphs,
  available,
  active,
  myPostedContract,
  onAcceptGenerated,
  onClaimPlayer,
  onComplete,
  onRemove,
}: {
  onBack: () => void;
  onPostNew: () => void;
  triumphs: number;
  available: Contract[];
  active: ActiveContract[];
  myPostedContract: MyPostedContract | null;
  onAcceptGenerated: (type: string) => void;
  onClaimPlayer: (id: number) => void;
  onComplete: () => void;
  onRemove: () => void;
}) => (
  <Box
    style={{
      background: '#0a0a0a',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontSize: '1em',
    }}
  >
    {topBar('Contracts', onBack)}
    <Box style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
      {!myPostedContract && (
        <Box style={{ marginTop: '10px' }}>
          <Box
            onClick={triumphs > 0 ? onPostNew : undefined}
            style={{ ...(triumphs > 0 ? BUTTON_RED : BUTTON_DARK), fontSize: '1.5em' }}
          >
            <Icon
              name="plus"
              style={{
                color: triumphs > 0 ? '#8b0000' : '#333',
                width: '16px',
              }}
            />
            Add Contract
          </Box>
        </Box>
      )}

      {myPostedContract && (
        <>
          <Box
            style={{
              color: '#c80',
              fontSize: '0.7em',
              marginBottom: '4px',
              marginTop: '12px',
              letterSpacing: '0.05em',
            }}
          >
            MY POSTED CONTRACT
          </Box>
          <MyPostedContractCard
            contract={myPostedContract}
            triumphs={triumphs}
            onComplete={onComplete}
            onRemove={onRemove}
          />
        </>
      )}

      {available.length > 0 && (
        <>
          <Box
            style={{
              color: '#555',
              fontSize: '1.4em',
              marginBottom: '4px',
              marginTop: '12px',
              letterSpacing: '0.05em',
            }}
          >
            AVAILABLE
          </Box>
          {available.map((c) => (
            <ContractCard
              key={c.is_player_contract ? `pc_${c.player_contract_id}` : c.type}
              contract={c}
              onAccept={() => {
                if (c.is_player_contract) {
                  onClaimPlayer(c.player_contract_id!);
                } else {
                  onAcceptGenerated(c.type);
                }
              }}
            />
          ))}
        </>
      )}

      {active.length > 0 && (
        <>
          <Box
            style={{
              color: '#555',
              fontSize: '1.4em',
              marginBottom: '4px',
              marginTop: '12px',
              letterSpacing: '0.05em',
            }}
          >
            MY CONTRACTS
          </Box>
          {active.map((c, i) => (
            <ActiveContractCard key={i} contract={c} />
          ))}
        </>
      )}

      {!myPostedContract && available.length === 0 && active.length === 0 && (
        <Box
          style={{
            color: '#444',
            fontSize: '1.8em',
            textAlign: 'center',
            marginTop: '32px',
          }}
        >
          No contracts available.
        </Box>
      )}
    </Box>
  </Box>
);

const MainMenu = ({
  triumphs,
  onNavigate,
  onBack,
}: {
  triumphs: number;
  onNavigate: (view: View) => void;
  onBack: () => void;
}) => (
  <Box
    style={{
      background: '#0a0a0a',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {topBar('Shr3kNet', onBack)}
    <Box style={{ flex: 1, padding: '12px 10px' }}>
      <Box
        className="Shr3kNet__CinzelFont"
        style={{
          textAlign: 'center',
          color: '#8b0000',
          fontSize: '1.7em',
          marginBottom: '2px',
          letterSpacing: '0.05em',
        }}
      >
        TRIUMPHS
      </Box>
      <Box
        className="Shr3kNet__CinzelFont"
        style={{
          textAlign: 'center',
          color: '#ccc',
          fontSize: '1.5em',
          fontWeight: 'bold',
          marginBottom: '12px',
        }}
      >
        {triumphs}
      </Box>

      <Box
        className="Shr3kNet__CinzelFont"
        onClick={() => onNavigate('leaderboard')}
        style={{ ...BUTTON_RED, fontSize: '1.7em', fontWeight: 'bold' }}
      >
        <Icon name="trophy" style={{ color: '#8b0000', width: '16px' }} />
        Leaderboard
      </Box>

      <Box
        className="Shr3kNet__CinzelFont"
        onClick={() => onNavigate('contracts')}
        style={{ ...BUTTON_RED, fontSize: '1.7em', fontWeight: 'bold' }}
      >
        <Icon name="scroll" style={{ color: '#8b0000', width: '16px' }} />
        Contracts
      </Box>

      <Box
        className="Shr3kNet__CinzelFont"
        style={{ ...BUTTON_DARK, fontSize: '1.7em', fontWeight: 'bold' }}
      >
        <Icon name="users" style={{ color: '#333', width: '16px' }} />
        Personnel Management
        <Box
          as="span"
          style={{ marginLeft: 'auto', fontSize: '0.5em', color: '#333' }}
        >
          soon
        </Box>
      </Box>
    </Box>
  </Box>
);

export const ScreenContracts = (props: {
  setApp: React.Dispatch<React.SetStateAction<NavigableApps | null>>;
}) => {
  const { act, data } = useBackend<Data>();
  const { setApp } = props;
  const [loggedIn, setLoggedIn] = useState(false);
  const [view, setView] = useState<View>('menu');
  const [mortalImage] = useState(() => {
    const images = [
      'mortal_eyes_1.jpg',
      'mortal_eyes_2.jpg',
      'mortal_eyes_3.jpg',
    ];
    return resolveAsset(images[Math.floor(Math.random() * images.length)]);
  });

  const active = (data.active_contracts || []) as ActiveContract[];
  const rawAvailable = (data.available_contracts || []) as Contract[];
  const playerContractCount = rawAvailable.filter(
    (c) => c.is_player_contract,
  ).length;
  const available = useMemo(
    () => rawAvailable,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active.length, playerContractCount],
  );
  const leaderboard = (data.leaderboard || []) as LeaderboardEntry[];
  const triumphs = data.triumphs || 0;
  const username = data.shr3knet_username || '';
  const myPostedContract = (data.my_posted_contract ||
    null) as MyPostedContract | null;
  const isKindred = !!data.is_kindred;

  if (!isKindred) {
    return (
      <Box
        style={{
          backgroundImage: `url("${mortalImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100%',
          width: '100%',
        }}
      />
    );
  }

  let screen: React.ReactNode;
  if (!loggedIn) {
    screen = (
      <Box style={{ background: '#0a0a0a', height: '100%' }}>
        <LoginScreen onLogin={() => setLoggedIn(true)} />
      </Box>
    );
  } else if (view === 'leaderboard') {
    screen = (
      <LeaderboardScreen
        onBack={() => setView('menu')}
        triumphs={triumphs}
        username={username}
        leaderboard={leaderboard}
        onSetUsername={(name) =>
          act('set_shr3knet_username', { username: name })
        }
      />
    );
  } else if (view === 'post') {
    screen = (
      <PostContractForm
        onBack={() => setView('contracts')}
        triumphs={triumphs}
        onPost={(name, description, reward) => {
          act('post_contract', { name, description, reward });
          setView('contracts');
        }}
      />
    );
  } else if (view === 'contracts') {
    screen = (
      <ContractsScreen
        onBack={() => setView('menu')}
        onPostNew={() => setView('post')}
        triumphs={triumphs}
        available={available}
        active={active}
        myPostedContract={myPostedContract}
        onAcceptGenerated={(type) => act('accept_contract', { type })}
        onClaimPlayer={(id) => act('claim_player_contract', { id })}
        onComplete={() => act('complete_posted_contract')}
        onRemove={() => act('remove_posted_contract')}
      />
    );
  } else {
    screen = (
      <MainMenu
        triumphs={triumphs}
        onNavigate={(v) => setView(v)}
        onBack={() => setApp(null)}
      />
    );
  }

  return (
    <div className="Shr3kNet__TerminalFont" style={{ height: '100%' }}>
      {screen}
    </div>
  );
};
