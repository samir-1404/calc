import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Box, Heading, Text, VStack, Button } from '@chakra-ui/react';

export default function Home() {
  const { t } = useTranslation('common');

  return (
    <Box textAlign="center" py={10} px={6} maxW="800px" mx="auto">
      <Heading as="h1" size="2xl" mb={4} color="teal.600">
        {t('welcome')}
      </Heading>
      <Text fontSize="xl" mb={8} color="gray.600">
        {t('select_calculator')}
      </Text>
      <VStack spacing={4}>
        <Button as={Link} href="/greenhouse" colorScheme="teal" size="lg" w="200px">
          {t('greenhouse_calculator')}
        </Button>
        <Button as={Link} href="/irrigation" colorScheme="teal" size="lg" w="200px">
          {t('irrigation_calculator')}
        </Button>
        <Button as={Link} href="/residential" colorScheme="teal" size="lg" w="200px">
          {t('residential_calculator')}
        </Button>
        <Button as={Link} href="/admin" colorScheme="teal" size="lg" w="200px">
          {t('admin_panel')}
        </Button>
        <Button as={Link} href="/signup" colorScheme="teal" size="lg" w="200px">
          {t('signup')}
        </Button>
      </VStack>
    </Box>
  );
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}