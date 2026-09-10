import type {VisualRole} from '../../view-model/visualRoles';

/**
 * Small renderer-only role symbols. They are deliberately schematic and
 * decorative; text labels remain the accessible/non-color role cue.
 */
export function RoleIcon({role, x, y}: {role: VisualRole; x: number; y: number}) {
  const common = {className: 'node-role-icon', transform: `translate(${x} ${y})`} as const;

  switch (role) {
    case 'compute':
      return (
        <g {...common}>
          <rect x="3" y="3" width="20" height="20" rx="3" />
          <path d="M8 8h10v10H8zM0 8h3M0 14h3M23 8h3M23 14h3M8 0v3M14 0v3M8 23v3M14 23v3" />
        </g>
      );
    case 'memory':
      return (
        <g {...common}>
          <rect x="3" y="4" width="20" height="5" rx="1" />
          <rect x="3" y="11" width="20" height="5" rx="1" />
          <rect x="3" y="18" width="20" height="5" rx="1" />
          <path d="M7 2v2M12 2v2M17 2v2M7 23v2M12 23v2M17 23v2" />
        </g>
      );
    case 'network':
      return (
        <g {...common}>
          <circle cx="5" cy="13" r="3" />
          <circle cx="21" cy="5" r="3" />
          <circle cx="21" cy="21" r="3" />
          <path d="M8 12 18 6M8 14l10 6M21 8v10" />
        </g>
      );
    case 'storage':
      return (
        <g {...common}>
          <rect x="3" y="4" width="20" height="18" rx="3" />
          <path d="M6 10h14M6 16h14" />
          <circle cx="18" cy="19" r="1.5" />
        </g>
      );
    case 'power':
      return (
        <g {...common}>
          <path d="M15 1 6 14h7l-2 11 9-14h-7z" />
        </g>
      );
    case 'cooling':
      return (
        <g {...common}>
          <circle cx="13" cy="13" r="3" />
          <path d="M13 3c5 0 6 3 4 7M23 13c0 5-3 6-7 4M13 23c-5 0-6-3-4-7M3 13c0-5 3-6 7-4" />
        </g>
      );
    case 'management':
      return (
        <g {...common}>
          <rect x="3" y="4" width="20" height="18" rx="3" />
          <path d="m7 10 4 3-4 3M13 17h6" />
        </g>
      );
    case 'io_interconnect':
      return (
        <g {...common}>
          <rect x="3" y="6" width="8" height="14" rx="2" />
          <rect x="15" y="6" width="8" height="14" rx="2" />
          <path d="M11 10h4M11 16h4M6 10h2M18 10h2M6 16h2M18 16h2" />
        </g>
      );
    case 'structure':
      return (
        <g {...common}>
          <path d="M4 3h18v20H4zM8 3v20M18 3v20M4 9h18M4 17h18" />
        </g>
      );
    case 'neutral_support':
    default:
      return (
        <g {...common}>
          <circle cx="13" cy="13" r="9" />
          <path d="M9 13h8M13 9v8" />
        </g>
      );
  }
}
