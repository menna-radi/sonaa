import React from 'react';
import type { Submission } from '../types';
import { Card, StatTile } from '../../../components/ui';
import { User, Phone, Mail, MapPin, Smartphone, Calendar, Hash } from 'lucide-react';

interface ProfileInfoStepProps {
  submission: Submission;
}

export const ProfileInfoStep: React.FC<ProfileInfoStepProps> = ({ submission }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
      {/* Contact & Personal Details Card */}
      <Card title="Personal & Contact Information" padding="md">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--sp-3)',
          }}
        >
          <StatTile
            label="Full Legal Name"
            value={submission.name}
            icon={<User size={16} />}
          />
          {submission.phoneNumber && (
            <StatTile
              label="Phone Number"
              value={submission.phoneNumber}
              icon={<Phone size={16} />}
            />
          )}
          {submission.email && (
            <StatTile
              label="Email Address"
              value={submission.email}
              icon={<Mail size={16} />}
            />
          )}
          {submission.city && (
            <StatTile
              label="City / District"
              value={submission.city}
              icon={<MapPin size={16} />}
            />
          )}
          {submission.dateOfBirth && (
            <StatTile
              label="Date of Birth"
              value={submission.dateOfBirth}
              icon={<Calendar size={16} />}
            />
          )}
          {submission.nationality && (
            <StatTile
              label="Nationality"
              value={submission.nationality}
            />
          )}
          {submission.residentialAddress && (
            <StatTile
              label="Residential Address"
              value={submission.residentialAddress}
              icon={<MapPin size={16} />}
            />
          )}
          {submission.emergencyContactPhone && (
            <StatTile
              label="Emergency Contact"
              value={submission.emergencyContactPhone}
              icon={<Phone size={16} />}
            />
          )}
        </div>
      </Card>

      {/* Device & System Diagnostics (if available) */}
      {(submission.deviceOs || submission.appVersion || submission.registeredDate) && (
        <Card title="Device & Registration Diagnostics" padding="md">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--sp-3)',
            }}
          >
            {submission.deviceOs && (
              <StatTile
                label="Operating System"
                value={submission.deviceOs}
                icon={<Smartphone size={16} />}
              />
            )}
            {submission.appVersion && (
              <StatTile
                label="App Version"
                value={submission.appVersion}
                icon={<Smartphone size={16} />}
              />
            )}
            {submission.registeredDate && (
              <StatTile
                label="Registration Date"
                value={submission.registeredDate}
                icon={<Calendar size={16} />}
              />
            )}
            <StatTile
              label="Verification ID"
              value={submission.verificationId}
              icon={<Hash size={16} />}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfileInfoStep;
