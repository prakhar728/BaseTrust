import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Shield, Wallet, Users, Clock, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

const chitFundData = {
  name: "Community Growth Fund",
  contractAddress: "0x1234...5678",
  amountInCirculation: "500,000",
  peopleInvolved: 50,
  nextPoolRecipient: "0xabcd...efgh",
  endDateTime: "2024-12-31T23:59:59",
  participants: [
    { address: "0x1111...1111", status: "Pooled In", dueDate: null },
    { address: "0x2222...2222", status: "Next Due", dueDate: "2024-06-15" },
    { address: "0x3333...3333", status: "Upcoming", dueDate: "2024-07-15" },
    // ... more participants
  ],
  defaulters: [
    { address: "0x9999...9999", missedDate: "2024-05-01", amountDue: "10,000" },
    // ... more defaulters if any
  ]
}

export default function ChitFundPage() {
  const [activeTab, setActiveTab] = useState('details')
  const [userStatus, setUserStatus] = useState('Upcoming') // This would be determined by the user's actual status
  const [isLoading, setIsLoading] = useState(false)

  const handlePoolAction = () => {
    setIsLoading(true)
    // Simulate an API call or blockchain transaction
    setTimeout(() => {
      setUserStatus('Pooled In')
      setIsLoading(false)
    }, 2000)
  }

  const renderActionButton = () => {
    switch (userStatus) {
      case 'Next Due':
        return (
          <Button onClick={handlePoolAction} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wallet className="mr-2 h-4 w-4" />}
            {isLoading ? 'Processing...' : 'Pool In Now'}
          </Button>
        )
      case 'Pooled In':
        return (
          <Button disabled className="w-full md:w-auto bg-green-500 hover:bg-green-600">
            <CheckCircle className="mr-2 h-4 w-4" />
            Already Pooled In
          </Button>
        )
      default:
        return (
          <Button disabled className="w-full md:w-auto">
            <XCircle className="mr-2 h-4 w-4" />
            Not Your Turn
          </Button>
        )
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-primary text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            <Shield className="mr-2 h-6 w-6" />
            {chitFundData.name}
          </h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8"
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-primary" />
                Contract Address
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-mono">{chitFundData.contractAddress}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="mr-2 h-5 w-5 text-primary" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{chitFundData.peopleInvolved}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-primary" />
                Amount in Circulation
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">₹{chitFundData.amountInCirculation}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Wallet className="mr-2 h-5 w-5 text-primary" />
                Next Pool Recipient
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm font-mono">{chitFundData.nextPoolRecipient}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Chit Fund Ends On
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              {new Date(chitFundData.endDateTime).toLocaleString()}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Shield className="mr-2 h-5 w-5 text-primary" />
                Your Action
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderActionButton()}
            </CardContent>
          </Card>
        </motion.div>

        <div className="mb-4">
          <Button
            variant={activeTab === 'details' ? 'default' : 'outline'}
            onClick={() => setActiveTab('details')}
            className="mr-2"
          >
            Participant Details
          </Button>
          <Button
            variant={activeTab === 'defaulters' ? 'default' : 'outline'}
            onClick={() => setActiveTab('defaulters')}
          >
            Defaulters
          </Button>
        </div>

        {activeTab === 'details' && (
          <motion.div variants={fadeIn} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle>Participant Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wallet Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Due Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chitFundData.participants.map((participant, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-mono">{participant.address}</TableCell>
                        <TableCell>{participant.status}</TableCell>
                        <TableCell>{participant.dueDate || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {activeTab === 'defaulters' && (
          <motion.div variants={fadeIn} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                  Defaulters
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chitFundData.defaulters.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Wallet Address</TableHead>
                        <TableHead>Missed Date</TableHead>
                        <TableHead>Amount Due</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chitFundData.defaulters.map((defaulter, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">{defaulter.address}</TableCell>
                          <TableCell>{defaulter.missedDate}</TableCell>
                          <TableCell>₹{defaulter.amountDue}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center py-4">No defaulters at this time.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          © 2024 BaseTrust. All rights reserved.
        </div>
      </footer>
    </div>
  )
}